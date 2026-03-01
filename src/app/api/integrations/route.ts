import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { provider, token } = body;

        if (!provider || !token) {
            return NextResponse.json({ error: 'Valid provider and token are required' }, { status: 400 });
        }

        const integration = await prisma.integration.upsert({
            where: { provider },
            update: { token, isActive: true },
            create: { provider, token, isActive: true }
        });

        return NextResponse.json({ success: true, integration });

    } catch (error) {
        console.error('Integration save error:', error);
        return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 });
    }
}
