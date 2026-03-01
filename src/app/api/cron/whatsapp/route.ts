import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { differenceInDays, startOfDay } from 'date-fns';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.warn('Unauthorized cron invocation attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const today = startOfDay(new Date());

        // 0. STRICT 1-MONTH EXPIRATION ENFORCEMENT
        // Expire any active membership where its endDate has passed, regardless of invoice status.
        const expiredCount = await prisma.membership.updateMany({
            where: {
                status: 'ACTIVE',
                endDate: { lt: today }
            },
            data: {
                status: 'EXPIRED'
            }
        });
        if (expiredCount.count > 0) {
            console.log(`[CRON] Strictly expired ${expiredCount.count} memberships that passed their 1-month cycle.`);
        }

        // 1. AUTO-GENERATE RECURRING INVOICES
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        const recurringMemberships = await prisma.membership.findMany({
            where: {
                status: 'ACTIVE',
                planId: { not: null },
                endDate: { lte: fiveDaysFromNow }
            },
            include: { plan: true, payments: { orderBy: { dueDate: 'desc' }, take: 1 } }
        });

        for (const membership of recurringMemberships) {
            if (!membership.plan) continue;
            const lastPayment = membership.payments[0];

            // If the last payment's due date is the same as the current membership end date,
            // we've already generated the current/next invoice.
            const membershipEnd = startOfDay(new Date(membership.endDate!));
            if (lastPayment && startOfDay(new Date(lastPayment.dueDate)).getTime() >= membershipEnd.getTime()) {
                continue;
            }

            // Generate next month's invoice
            await prisma.payment.create({
                data: {
                    membershipId: membership.id,
                    amount: membership.plan.monthlyFee,
                    dueDate: membership.endDate!,
                    paymentStatus: 'UNPAID'
                }
            });
        }

        // 2. FETCH ALL UNPAID PAYMENTS FOR REMINDERS
        const unpaidPayments = await prisma.payment.findMany({
            where: { paymentStatus: 'UNPAID' },
            include: {
                membership: {
                    include: { user: true }
                }
            }
        });

        let sentCount = 0;

        for (const payment of unpaidPayments) {
            if (!payment.membership.user.phone_number) continue;

            const due = startOfDay(new Date(payment.dueDate));
            const daysDiff = differenceInDays(due, today);

            let messageType = null;
            let templateStr = '';

            if (daysDiff === 3) {
                messageType = 'REMINDER';
                templateStr = `Hello ${payment.membership.user.name}, your gym fee of ₹${payment.amount} for FitFlow is due in 3 days. To avoid a lapse in your training, please pay here: https://fitflow.app/pay. Team FitFlow.`;
            } else if (daysDiff === 0) {
                messageType = 'DUE_TODAY';
                templateStr = `Hello ${payment.membership.user.name}, your gym fee of ₹${payment.amount} for FitFlow is due TODAY. To avoid a lapse in your training and biometric access, please pay here: https://fitflow.app/pay. Team FitFlow.`;
            } else if (daysDiff === -1) {
                messageType = 'OVERDUE';
                templateStr = `Hello ${payment.membership.user.name}, your gym fee of ₹${payment.amount} for FitFlow is now overdue. Access is suspended. To restore your training and biometric access, please pay here: https://fitflow.app/pay. Team FitFlow.`;

                await prisma.membership.update({
                    where: { id: payment.membership.id },
                    data: { status: 'EXPIRED' }
                });
            }

            if (messageType) {
                const result = await sendWhatsAppMessage(payment.membership.user.phone_number, templateStr);
                if (result.success) {
                    sentCount++;
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            lastNotifiedDate: new Date(),
                            waTemplateId: messageType
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true, messagesSent: sentCount, timestamp: new Date().toISOString() });

    } catch (error) {
        console.error('Cron error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
