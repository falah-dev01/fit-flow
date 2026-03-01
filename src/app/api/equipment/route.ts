import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, serialNumber, status, lastMaintenance, nextMaintenance, notes } = body;

        if (!name || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const equipment = await prisma.equipment.create({
            data: {
                name,
                serialNumber: serialNumber || null,
                status,
                lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
                nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
                notes: notes || null,
            },
        });

        return NextResponse.json(equipment, { status: 201 });
    } catch (error) {
        console.error('Error creating equipment log:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
