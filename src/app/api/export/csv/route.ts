import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'payments';

    try {
        let csvContent = '';

        if (type === 'payments') {
            const payments = await prisma.payment.findMany({
                include: { membership: { include: { user: true } } },
                orderBy: { dueDate: 'asc' }
            });

            csvContent = 'Invoice ID,Customer Name,Amount,Status,Due Date\n';
            payments.forEach((p) => {
                csvContent += `INV-${p.id.substring(0, 6).toUpperCase()},"${p.membership.user.name}",${p.amount},${p.paymentStatus},${p.dueDate.toISOString().split('T')[0]}\n`;
            });
        } else if (type === 'members') {
            const members = await prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                include: { memberships: true }
            });

            csvContent = 'Member ID,Name,Email,Phone,Joined Date\n';
            members.forEach((m) => {
                csvContent += `${m.id},"${m.name}","${m.email}","${m.phone_number || ''}",${m.createdAt.toISOString().split('T')[0]}\n`;
            });
        }

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${type}_export.csv"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
    }
}
