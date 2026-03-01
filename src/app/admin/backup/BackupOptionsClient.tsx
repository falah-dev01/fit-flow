'use client';

import { useState } from 'react';
import { Cloud, Database, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackupOptionsClient({ initialIntegrations }: { initialIntegrations: any[] }) {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<'DROPBOX' | 'GOOGLE_DRIVE' | null>(null);
    const [tokenInput, setTokenInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const isConnected = (provider: string) => {
        return initialIntegrations.some(int => int.provider === provider && int.isActive);
    };

    const handleSaveIntegration = async () => {
        if (!activeModal || !tokenInput.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: activeModal, token: tokenInput.trim() })
            });

            if (!res.ok) throw new Error('Failed to configure integration');

            router.refresh();
            setActiveModal(null);
            setTokenInput('');
        } catch (error) {
            console.error(error);
            alert('Failed to save integration settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloudBackup = async (provider: string) => {
        setIsUploading(provider);
        try {
            const res = await fetch('/api/backup/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            alert(`✅ ${data.message}`);
        } catch (error: any) {
            console.error(error);
            alert(`❌ Upload Error: ${error.message}`);
        } finally {
            setIsUploading(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <Cloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Online Cloud Options</h3>
                </div>
                <p className="text-sm text-slate-600">
                    Securely connect your cloud provider to push database backups directly to your remote storage.
                </p>
            </div>

            <div className="p-6 flex-grow space-y-4">

                {/* Google Drive */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-100 shrink-0">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                <path d="M12.012 1.995a1.006 1.006 0 0 0-.877.518L6.463 10.61c-.139.24-.139.529 0 .769L11.136 20a1.006 1.006 0 0 0 .877.518h10.98a1.006 1.006 0 0 0 .877-.518l-4.673-8.096a1.006 1.006 0 0 0-.877-.518H12.012zm-3.056 9.613L4.283 20h10.98l-4.673-8.392H8.956z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                Google Drive
                                {isConnected('GOOGLE_DRIVE') && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </h4>
                            <p className="text-xs text-slate-500">{isConnected('GOOGLE_DRIVE') ? 'Ready to upload' : 'Service Account not configured'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveModal('GOOGLE_DRIVE')}
                            className="px-4 py-2 flex-1 sm:flex-none border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {isConnected('GOOGLE_DRIVE') ? 'Re-Configure' : 'Connect'}
                        </button>
                        {isConnected('GOOGLE_DRIVE') && (
                            <button
                                onClick={() => handleCloudBackup('GOOGLE_DRIVE')}
                                disabled={isUploading === 'GOOGLE_DRIVE'}
                                className="px-4 py-2 flex-1 sm:flex-none bg-sky-600 rounded-lg text-sm font-semibold text-white hover:bg-sky-700 transition-colors disabled:opacity-50"
                            >
                                {isUploading === 'GOOGLE_DRIVE' ? 'Uploading...' : 'Backup Now'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Dropbox */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-100 shrink-0">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0052CC">
                                <path d="M12.012 1.995a1.006 1.006 0 0 0-.877.518L6.463 10.61c-.139.24-.139.529 0 .769L11.136 20a1.006 1.006 0 0 0 .877.518h10.98a1.006 1.006 0 0 0 .877-.518l-4.673-8.096a1.006 1.006 0 0 0-.877-.518H12.012z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                Dropbox
                                {isConnected('DROPBOX') && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </h4>
                            <p className="text-xs text-slate-500">{isConnected('DROPBOX') ? 'Ready to upload' : 'Access Token not configured'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveModal('DROPBOX')}
                            className="px-4 py-2 flex-1 sm:flex-none border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {isConnected('DROPBOX') ? 'Re-Configure' : 'Connect'}
                        </button>
                        {isConnected('DROPBOX') && (
                            <button
                                onClick={() => handleCloudBackup('DROPBOX')}
                                disabled={isUploading === 'DROPBOX'}
                                className="px-4 py-2 flex-1 sm:flex-none bg-[#0052CC] rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isUploading === 'DROPBOX' ? 'Uploading...' : 'Backup Now'}
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setActiveModal(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900">
                                Configure {activeModal === 'DROPBOX' ? 'Dropbox' : 'Google Drive'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-amber-50 p-3 rounded-lg flex gap-3 text-sm text-amber-800 border border-amber-200">
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Your credentials are encrypted & stored safely.</p>
                                    {activeModal === 'GOOGLE_DRIVE' ? (
                                        <p className="text-xs mt-1">
                                            <strong>Crucial Step:</strong> Service Accounts have no free storage quota. You must create a folder in your personal Google Drive, share it with your Service Account email, and add <code>"fitflow_folder_id": "YOUR_FOLDER_ID"</code> to the bottom of your JSON before saving.
                                        </p>
                                    ) : (
                                        <p className="text-xs mt-1">They will only be used to upload your database backups.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {activeModal === 'DROPBOX' ? 'Dropbox Access Token' : 'Service Account JSON (with Folder ID)'}
                                </label>
                                <textarea
                                    className="w-full h-40 p-3 font-mono text-xs text-slate-800 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none outline-none border"
                                    placeholder={activeModal === 'DROPBOX' ? "sl.xxxxxxx..." : '{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  "client_email": "...",\n  ...\n  "fitflow_folder_id": "1A2B3D4E5G6H..."\n}'}
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveIntegration}
                                    disabled={isSaving || !tokenInput.trim()}
                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
