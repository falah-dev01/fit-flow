import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const members = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: { memberships: true },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(members);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, phone_number, planId, paymentMethod = 'CASH', splitCash, splitGpay } = await request.json();

        // Auto-generate required constraints for customer
        const email = `member_${Date.now()}_${Math.floor(Math.random() * 1000)}@fitflow.local`;
        const password_hash = await bcrypt.hash('FitFlow#Secure2026', 10);

        let membershipData: any = {
            status: 'PENDING',
            feeAmount: 0,
        };

        if (planId) {
            const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
            if (plan) {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1); // Default to monthly cycle

                membershipData = {
                    planId,
                    status: 'ACTIVE',
                    feeAmount: plan.entryFee + plan.monthlyFee,
                    startDate,
                    endDate,
                };
            }
        }

        const user = await prisma.user.create({
            data: {
                name, email, phone_number, password_hash, role: 'CUSTOMER',
                memberships: {
                    create: membershipData
                }
            },
            include: { memberships: true }
        });

        // Immediately log the upfront payment if an active plan was purchased
        const primaryMembership = user.memberships[0];
        if (primaryMembership && primaryMembership.status === 'ACTIVE' && primaryMembership.feeAmount > 0) {
            await prisma.payment.create({
                data: {
                    membershipId: primaryMembership.id,
                    amount: primaryMembership.feeAmount,
                    dueDate: new Date(),
                    paymentStatus: 'PAID', // Instantly flag as paid to show in revenue
                    paymentMethod,
                    splitCash: paymentMethod === 'SPLIT' ? parseFloat(splitCash) || 0 : null,
                    splitGpay: paymentMethod === 'SPLIT' ? parseFloat(splitGpay) || 0 : null
                }
            });
        }

        return NextResponse.json({ user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
    }
}    
