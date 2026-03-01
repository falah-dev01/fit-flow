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
        const { status } = await request.json();

        if (!['BOOKED', 'ATTENDED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const attendance = await prisma.classAttendance.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
