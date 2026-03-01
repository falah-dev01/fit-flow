import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized. Only admins can create staff.' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, phone_number, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (role !== 'ADMIN' && role !== 'TRAINER') {
            return NextResponse.json({ error: 'Invalid role assignment' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                phone_number,
                role,
            },
            select: { id: true, name: true, email: true, role: true } // Exclude password hash
        });

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error) {
        console.error('Error creating staff:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
