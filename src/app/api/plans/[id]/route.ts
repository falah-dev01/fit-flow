import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                name: body.name,
                entryFee: typeof body.entryFee === 'number' ? body.entryFee : parseFloat(body.entryFee),
                monthlyFee: typeof body.monthlyFee === 'number' ? body.monthlyFee : parseFloat(body.monthlyFee),
                description: body.description,
                isActive: body.isActive
            }
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
