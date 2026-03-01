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
        const { retailItemId, quantity } = body;

        if (!retailItemId || !quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const qty = parseInt(quantity, 10);
        if (qty <= 0) {
            return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
        }

        // Must run in a transaction to safely deduct stock
        const sale = await prisma.$transaction(async (tx) => {
            const item = await tx.retailItem.findUnique({
                where: { id: retailItemId }
            });

            if (!item) throw new Error('Item not found');
            if (item.stockCount < qty) throw new Error('Not enough stock available');

            const totalAmount = item.price * qty;

            const updatedItem = await tx.retailItem.update({
                where: { id: retailItemId },
                data: { stockCount: { decrement: qty } }
            });

            const newSale = await tx.retailSale.create({
                data: {
                    retailItemId,
                    quantity: qty,
                    totalAmount,
                    soldById: session.userId as string,
                }
            });

            return newSale;
        });

        return NextResponse.json(sale, { status: 201 });
    } catch (error: any) {
        console.error('Error logging sale:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
