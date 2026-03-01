'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function DownloadBackupButton() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/backup/download');

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to download backup');
            }

            // Create a blob from the response and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Format filename with current date: fitflow_backup_YYYY-MM-DD.db
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `fitflow_backup_${dateStr}.db`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error: any) {
            console.error('Backup error:', error);
            alert(`Download failed: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Structuring Security Backup...' : 'Download Local Backup (.db)'}
        </button>
    );
}
