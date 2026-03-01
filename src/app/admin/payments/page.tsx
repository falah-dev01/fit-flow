import prisma from '@/lib/prisma';
import PaymentsTableClient from './PaymentsTableClient';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    const payments = await prisma.payment.findMany({
        include: {
            membership: {
                include: { user: true }
            }
        },
        orderBy: { dueDate: 'asc' }
    });

    return (
        <PaymentsTableClient initialPayments={payments} />
    );
}
