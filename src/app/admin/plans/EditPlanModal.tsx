'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, X } from 'lucide-react';

export default function EditPlanModal({
    plan
}: {
    plan: {
        id: string;
        name: string;
        entryFee: number;
        monthlyFee: number;
        description: string | null;
        isActive: boolean;
    }
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: plan.name,
        entryFee: plan.entryFee,
        monthlyFee: plan.monthlyFee,
        description: plan.description || '',
        isActive: plan.isActive,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/plans/${plan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    entryFee: Number(formData.entryFee),
                    monthlyFee: Number(formData.monthlyFee)
                }),
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert('Failed to update plan');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
                <Settings className="w-4 h-4" /> Edit
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">Edit Plan: {plan.name}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Entry Fee (₹)</label>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={formData.entryFee}
                                        onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (₹)</label>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={formData.monthlyFee}
                                        onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2 cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={() => { }} // handled by div click
                                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                />
                                <label className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                                    Plan is actively offered to new members
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
