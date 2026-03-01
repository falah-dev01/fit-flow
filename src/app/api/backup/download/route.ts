import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        // Path to the SQLite database
        const dbPath = join(process.cwd(), 'prisma', 'dev.db');

        try {
            await stat(dbPath);
        } catch (e) {
            return NextResponse.json({ error: 'Database file not found.' }, { status: 404 });
        }

        const fileStats = await stat(dbPath);
        const stream = createReadStream(dbPath);

        // Convert Node.js ReadStream to Web ReadableStream
        const readableStream = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            },
            cancel() {
                stream.destroy();
            }
        });

        // Set headers to trigger a file download in the browser
        return new NextResponse(readableStream as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename="fitflow_backup_${new Date().toISOString().split('T')[0]}.db"`,
                'Content-Length': fileStats.size.toString(),
            },
        });

    } catch (error) {
        console.error('Backup download error:', error);
        return NextResponse.json({ error: 'Failed to process backup request.' }, { status: 500 });
    }
}
