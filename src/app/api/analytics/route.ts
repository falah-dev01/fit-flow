import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. REVENUE CHART DATA (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        const payments = await prisma.payment.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: sixMonthsAgo }
            },
            select: { amount: true, createdAt: true }
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenueMap = new Map<string, number>();

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthlyRevenueMap.set(`${monthNames[d.getMonth()]}`, 0);
        }

        payments.forEach(p => {
            const monthStr = monthNames[p.createdAt.getMonth()];
            if (monthlyRevenueMap.has(monthStr)) {
                monthlyRevenueMap.set(monthStr, (monthlyRevenueMap.get(monthStr) || 0) + p.amount);
            }
        });

        const revenueData = Array.from(monthlyRevenueMap.entries()).map(([name, Total]) => ({ name, Total }));

        // 2. PLAN DISTRIBUTION DATA (Active Memberships)
        const activeMemberships = await prisma.membership.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        });

        const planCountMap = new Map<string, number>();
        activeMemberships.forEach(m => {
            const planName = m.plan ? m.plan.name : 'Custom Plan';
            planCountMap.set(planName, (planCountMap.get(planName) || 0) + 1);
        });

        const planDistributionData = Array.from(planCountMap.entries()).map(([name, value]) => ({ name, value }));

        // Colors mapping for Pie chart
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
        const formattedPlanData = planDistributionData.map((d, index) => ({
            ...d,
            color: COLORS[index % COLORS.length]
        }));


        // 3. ACTIONABLE ALERTS (Needs Attention)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const expiringMemberships = await prisma.membership.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { lte: threeDaysFromNow, gte: new Date() }
            },
            include: { user: true, plan: true }
        });

        const overdueInvoices = await prisma.payment.findMany({
            where: {
                paymentStatus: 'UNPAID',
                dueDate: { lt: new Date() }
            },
            include: { membership: { include: { user: true } } }
        });

        const alerts = [
            ...expiringMemberships.map(m => ({
                id: `exp-${m.id}`,
                name: m.user.name,
                issue: `Plan '${m.plan?.name || 'Custom'}' expires ${m.endDate?.toLocaleDateString() || 'soon'}`,
                badge: 'Warning'
            })),
            ...overdueInvoices.map(p => ({
                id: `ovd-${p.id}`,
                name: p.membership.user.name,
                issue: `Overdue payment of ₹${p.amount.toFixed(2)}`,
                badge: 'Overdue'
            }))
        ];


        // 4. RECENT ACTIVITY STREAM (Last 5 actions)
        const recentSignups = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { name: true, createdAt: true, id: true }
        });

        const recentPayments = await prisma.payment.findMany({
            where: { paymentStatus: 'PAID' },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            include: { membership: { include: { user: true } } }
        });

        const activities = [
            ...recentSignups.map(s => ({
                id: `sig-${s.id}`,
                action: 'New member joined',
                user: s.name,
                date: s.createdAt,
                type: 'signup'
            })),
            ...recentPayments.map(p => ({
                id: `pay-${p.id}`,
                action: `Paid ₹${p.amount}`,
                user: p.membership.user.name,
                date: p.updatedAt,
                type: 'payment'
            }))
        ]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5); // Take only absolute 5 most recent


        return NextResponse.json({
            revenueData,
            planDistributionData: formattedPlanData,
            alerts,
            activities
        });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
