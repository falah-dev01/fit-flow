'use client';

import { useState } from 'react';
import { UploadCloud, ShieldAlert, X, FileScan } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RestoreBackupClient() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.name.endsWith('.db')) {
            setFile(selectedFile);
        } else {
            alert('Please select a valid SQLite .db file.');
            setFile(null);
        }
    };

    const handleRestore = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('backupData', file);

        try {
            const res = await fetch('/api/backup/restore', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Restore failed');

            alert('✅ Success! Database successfully restored. The panel will now reload.');
            window.location.href = '/admin'; // Hard reload to clear all cached states
        } catch (error: any) {
            console.error(error);
            alert(`❌ Restore Error: ${error.message}`);
        } finally {
            setIsUploading(false);
            setIsConfirming(false);
            setFile(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Restore Database</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                        Upload a previously downloaded <code className="bg-slate-200 px-1 rounded text-red-600 text-xs">.db</code> file to completely restore your gym data.
                    </p>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full">
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-slate-400 focus:outline-none">
                            <span className="flex items-center space-x-2">
                                <FileScan className="w-6 h-6 text-slate-500" />
                                <span className="font-medium text-slate-600">
                                    {file ? (
                                        <span className="text-indigo-600">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    ) : (
                                        "Drop .db file to attach, or browse"
                                    )}
                                </span>
                            </span>
                            <input type="file" name="file_upload" className="hidden" accept=".db" onChange={handleFileChange} />
                        </label>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                        <button
                            onClick={() => setIsConfirming(true)}
                            disabled={!file}
                            className={`w-full md:w-48 px-4 py-3 font-semibold text-white rounded-xl transition-colors ${file ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'
                                }`}
                        >
                            Review & Restore
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isConfirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isUploading && setIsConfirming(false)}></div>
                    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4 text-red-600">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-6 w-6" />
                                <h3 className="text-lg font-bold">Critical Warning</h3>
                            </div>
                            {!isUploading && (
                                <button onClick={() => setIsConfirming(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-slate-700 text-sm mb-4">
                            You are about to restore the database using <strong>{file?.name}</strong>.
                        </p>
                        <p className="text-red-700 font-bold bg-red-50 p-3 rounded-lg border border-red-200 text-sm mb-6">
                            This action will irreversibly OVERWRITE all current data in the live system. Any data logged since this backup was downloaded will be permanently lost!
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsConfirming(false)}
                                disabled={isUploading}
                                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRestore}
                                disabled={isUploading}
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isUploading ? 'Restoring System...' : 'Overwrite Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
