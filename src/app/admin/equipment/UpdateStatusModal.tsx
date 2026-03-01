'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Settings2 } from 'lucide-react';

export default function UpdateStatusModal({
    equipmentId,
    equipmentName,
    currentStatus,
    currentNotes
}: {
    equipmentId: string,
    equipmentName: string,
    currentStatus: string,
    currentNotes?: string | null
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [notes, setNotes] = useState(currentNotes || '');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/equipment/${equipmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes }),
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary-600 hover:text-primary-700 font-semibold"
            >
                Update Status
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-left">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-primary-600" />
                                {equipmentName}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Machine Status</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['OPERATIONAL', 'MAINTENANCE', 'BROKEN'].map((s) => (
                                        <label key={s} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${status === s
                                                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                                : 'border-slate-200 hover:bg-slate-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value={s}
                                                checked={status === s}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`w-2 h-2 rounded-full ${s === 'OPERATIONAL' ? 'bg-emerald-500' :
                                                    s === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                            <span className="text-sm font-medium text-slate-900">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-semibold text-slate-900 mb-2">Maintenance Notes</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add details about breakage or service history..."
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 outline-none transition-shadow bg-slate-50 focus:bg-white min-h-[100px]"
                                />
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
