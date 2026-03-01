import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('backupData') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No backup file provided.' }, { status: 400 });
        }

        if (!file.name.endsWith('.db')) {
            return NextResponse.json({ error: 'Invalid file format. Only .db files are accepted.' }, { status: 400 });
        }

        const dbPath = join(process.cwd(), 'prisma', 'dev.db');
        const backupPath = join(process.cwd(), 'prisma', 'dev.db.backup');

        // 1. Create a safety copy of the current database before overwriting
        try {
            await fs.copyFile(dbPath, backupPath);
        } catch (copyErr) {
            console.warn('Could not create a safety backup of dev.db before restore. It might not exist yet.', copyErr);
        }

        // 2. Read the uploaded file into a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Overwrite the live database file with the uploaded buffer
        await fs.writeFile(dbPath, buffer);

        // We intentionally don't delete the .db.backup automatically so the user has an absolute fallback 
        // if the uploaded database was somehow corrupted.

        return NextResponse.json({ success: true, message: 'Database restored successfully.' });

    } catch (error) {
        console.error('Database restore error:', error);
        return NextResponse.json({ error: 'Internal Server Error during restoration.' }, { status: 500 });
    }
}
