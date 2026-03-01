import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { markAsPaid = false, paymentMethod = 'CASH', splitCash, splitGpay } = body;

        // Fetch User and their primary membership + plan
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                memberships: {
                    include: { plan: true },
                    take: 1
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const primaryMembership = user.memberships[0];

        if (!primaryMembership || !primaryMembership.plan) {
            return NextResponse.json({ error: 'User does not have an active Subscription Plan.' }, { status: 400 });
        }

        // Calculate the renewal cost (Monthly Fee ONLY, no Entry Fee)
        const renewalCost = primaryMembership.plan.monthlyFee;

        // Define when this new invoice is theoretically "due". 
        // If they are strictly expired, due today. If they are still active, due on their current expiration.
        let nextDueDate = new Date();
        if (primaryMembership.endDate && primaryMembership.endDate > nextDueDate) {
            nextDueDate = new Date(primaryMembership.endDate);
        }

        // 1. Generate the Payment Invoice
        const newPayment = await prisma.payment.create({
            data: {
                membershipId: primaryMembership.id,
                amount: renewalCost,
                dueDate: nextDueDate,
                paymentStatus: markAsPaid ? 'PAID' : 'UNPAID',
                paymentMethod: markAsPaid ? paymentMethod : null, // Only record method if it's actually paid
                splitCash: markAsPaid && paymentMethod === 'SPLIT' ? parseFloat(splitCash) || 0 : null,
                splitGpay: markAsPaid && paymentMethod === 'SPLIT' ? parseFloat(splitGpay) || 0 : null
            }
        });

        // 2. If 'markAsPaid' is true, immediately extend their membership
        if (markAsPaid) {
            const nextEndDate = new Date(nextDueDate);
            nextEndDate.setMonth(nextEndDate.getMonth() + 1);

            await prisma.membership.update({
                where: { id: primaryMembership.id },
                data: {
                    status: 'ACTIVE',
                    endDate: nextEndDate
                }
            });
        }

        return NextResponse.json({ success: true, payment: newPayment });

    } catch (error) {
        console.error('Error renewing member:', error);
        return NextResponse.json({ error: 'Failed to renew member' }, { status: 500 });
    }
}
