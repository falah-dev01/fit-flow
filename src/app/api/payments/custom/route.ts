import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { membershipId, amount, description, dueDate } = await req.json();

        if (!membershipId || !amount || !description || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const payment = await (prisma.payment as any).create({
            data: {
                membershipId,
                amount: parseFloat(amount),
                description,
                dueDate: new Date(dueDate),
                paymentStatus: 'UNPAID',
            },
        });

        return NextResponse.json(payment);
    } catch (error: any) {
        console.error('Error creating custom fee:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
