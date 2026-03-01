import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status, notes } = await request.json();

        if (status && !['OPERATIONAL', 'MAINTENANCE', 'BROKEN'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        // If status is changed to operational, we could potentially clear nextMaintenance
        // but it's safer to keep it for history unless requested otherwise.

        const equipment = await prisma.equipment.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(equipment);
    } catch (error) {
        console.error('Error updating equipment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
