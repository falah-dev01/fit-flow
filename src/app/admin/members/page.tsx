import prisma from '@/lib/prisma';
import MembersTableClient from './MembersTableClient';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    const members = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: { memberships: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <MembersTableClient initialMembers={members} />
    );
}
