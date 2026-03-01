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
        const body = await request.json();
        const { name, category, price, stockCount, restockAmount } = body;

        const currentItem = await prisma.retailItem.findUnique({ where: { id } });
        if (!currentItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (price !== undefined) updateData.price = parseFloat(price);

        if (restockAmount !== undefined) {
            updateData.stockCount = currentItem.stockCount + parseInt(restockAmount, 10);
        } else if (stockCount !== undefined) {
            updateData.stockCount = parseInt(stockCount, 10);
        }

        const item = await prisma.retailItem.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await prisma.retailItem.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
