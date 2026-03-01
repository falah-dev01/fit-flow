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
        const { name, category, price, stockCount } = body;

        if (!name || !category || !price || !stockCount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const item = await prisma.retailItem.create({
            data: {
                name,
                category,
                price: parseFloat(price),
                stockCount: parseInt(stockCount, 10),
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
