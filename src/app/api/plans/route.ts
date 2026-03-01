import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized. Only admins can manage plans.' }, { status: 401 });
        }

        const body = await req.json();
        const { name, entryFee, monthlyFee, description, isActive } = body;

        if (!name || entryFee === undefined || monthlyFee === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                entryFee: parseFloat(entryFee),
                monthlyFee: parseFloat(monthlyFee),
                description: description || null,
                isActive: isActive === 'true',
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
