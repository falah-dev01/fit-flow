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
        const { name, description, trainerId, startTime, endTime, capacity } = body;

        if (!name || !trainerId || !startTime || !endTime || !capacity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const classSchedule = await prisma.classSchedule.create({
            data: {
                name,
                description,
                trainerId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                capacity: parseInt(capacity, 10),
            },
        });

        return NextResponse.json(classSchedule, { status: 201 });
    } catch (error) {
        console.error('Error scheduling class:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
