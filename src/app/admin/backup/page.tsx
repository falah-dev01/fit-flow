import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Database, Download, Cloud, Shield, HardDrive, RefreshCw } from 'lucide-react';
import DownloadBackupButton from './DownloadBackupButton';
import BackupOptionsClient from './BackupOptionsClient';
import { stat } from 'fs/promises';
import { join } from 'path';
import RestoreBackupClient from './RestoreBackupClient';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BackupPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    let sizeInMB = '0.00';
    try {
        const dbPath = join(process.cwd(), 'prisma', 'dev.db');
        const stats = await stat(dbPath);
        sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    } catch (e) {
        console.error('Could not get DB size:', e);
    }

    const integrations = await prisma.integration.findMany();

    // Get last backup time from a theoretical settings table, using current time for display
    const lastBackup = new Date().toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Data Backup</h2>
                    <p className="text-slate-600 mt-1 text-sm">Secure your gym's data with local and cloud backup solutions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left side: Local tools */}
                <div className="flex flex-col gap-0">
                    {/* Local Backup Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                    <HardDrive className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Local Disk Backup</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Download a complete snapshot of your entire database directly to your computer.
                            </p>
                        </div>
                        <div className="p-6 flex-grow space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Database Size</span>
                                    <span className="text-xl font-bold text-slate-900">{sizeInMB} MB</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Download</span>
                                    <span className="text-sm font-semibold text-slate-900">{lastBackup}</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex gap-3">
                                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Security Recommendation</p>
                                    <p>We recommend downloading a local backup at least once a week. Keep the downloaded `.db` file in a secure, encrypted folder on your computer.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <DownloadBackupButton />
                        </div>
                    </div>

                    {/* Restore Section */}
                    <RestoreBackupClient />
                </div>

                {/* Cloud Backup Section */}
                <BackupOptionsClient initialIntegrations={integrations} />

            </div>
        </div>
    );
}
