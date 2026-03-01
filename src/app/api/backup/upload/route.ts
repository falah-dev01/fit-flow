import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import { join } from 'path';
import { Dropbox } from 'dropbox';
import { google } from 'googleapis';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { provider } = body;

        if (!provider || !['DROPBOX', 'GOOGLE_DRIVE'].includes(provider)) {
            return NextResponse.json({ error: 'Valid provider required' }, { status: 400 });
        }

        // Get the active token
        const integration = await prisma.integration.findUnique({
            where: { provider }
        });

        if (!integration || !integration.isActive || !integration.token) {
            return NextResponse.json({ error: `${provider} is not configured or active.` }, { status: 400 });
        }

        const dbPath = join(process.cwd(), 'prisma', 'dev.db');
        const fileContent = await fs.readFile(dbPath);
        const fileName = `fitflow_backup_${new Date().toISOString().split('T')[0]}.db`;

        // Process based on Provider SDKs
        if (provider === 'DROPBOX') {
            const dbx = new Dropbox({ accessToken: integration.token });
            try {
                await dbx.filesUpload({
                    path: `/${fileName}`,
                    contents: fileContent,
                    mode: { '.tag': 'overwrite' }
                });
                return NextResponse.json({ success: true, message: 'Uploaded to Dropbox successfully!' });
            } catch (dropboxError: any) {
                console.error("Dropbox Upload Error:", dropboxError);
                return NextResponse.json({ error: dropboxError?.error?.error_summary || 'Dropbox Upload Failed.' }, { status: 500 });
            }
        }

        if (provider === 'GOOGLE_DRIVE') {
            try {
                // Parse the stored JSON Service Account key
                const credentials = JSON.parse(integration.token);
                // Extract Folder ID if the user appended it to the JSON (we'll need to update the UI instructions)
                let folderId = credentials.fitflow_folder_id;

                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/drive'],
                });

                const drive = google.drive({ version: 'v3', auth });

                // We use passing buffer via stream for google apis
                const { Readable } = require('stream');
                const stream = new Readable();
                stream.push(fileContent);
                stream.push(null);

                const requestBody: any = {
                    name: fileName,
                    mimeType: 'application/x-sqlite3',
                };

                // If they provided a folder ID to upload into
                if (folderId) {
                    requestBody.parents = [folderId];
                }

                await drive.files.create({
                    requestBody,
                    media: {
                        mimeType: 'application/x-sqlite3',
                        body: stream,
                    },
                    fields: 'id',
                });

                return NextResponse.json({ success: true, message: 'Uploaded to Google Drive successfully!' });
            } catch (driveError: any) {
                console.error("Google Drive Upload Error:", driveError);
                return NextResponse.json({ error: driveError.message || 'Google Drive Upload Failed.' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Unsupported provider.' }, { status: 400 });

    } catch (error) {
        console.error('Cloud upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
