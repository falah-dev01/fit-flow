import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payments = await prisma.payment.findMany({
        include: {
            membership: {
                include: { user: true }
            }
        },
        orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(payments);
}

// Update payment status Endpoint
export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, paymentStatus } = await request.json();
        const payment = await prisma.payment.update({
            where: { id },
            data: { paymentStatus },
            include: { membership: true }
        });

        // Auto-Renew Membership logic
        if (paymentStatus === 'PAID' && payment.membership) {
            const currentEndDate = payment.membership.endDate ? new Date(payment.membership.endDate) : new Date();

            // Only extend if the payment we are fulfilling was actually due on or after the current end date,
            // OR if the membership was already expired. 
            // This prevents someone paying a 3-month old overdue invoice from accidentally getting 1 month of "future" access from today.
            const newEndDate = new Date(payment.dueDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);

            await prisma.membership.update({
                where: { id: payment.membershipId },
                data: {
                    status: 'ACTIVE', // Automatically restore access if they were expired
                    endDate: newEndDate
                }
            });
        }

        return NextResponse.json(payment);
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
