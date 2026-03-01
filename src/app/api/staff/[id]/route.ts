import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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
        const { name, email, phone_number, role, password } = await request.json();

        const updateData: any = { name, email, phone_number, role };
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating staff:', error);
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

        // Check if user exists and is staff
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.role === 'CUSTOMER') {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // Prevent self-deletion
        if (user.id === session.id) {
            return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing staff:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
