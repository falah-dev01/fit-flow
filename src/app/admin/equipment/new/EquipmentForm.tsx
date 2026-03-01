'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EquipmentForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/admin/equipment');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add equipment');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-1.5">Machine Name</label>
                    <input required type="text" name="name" id="name" placeholder="E.g. Commercial Treadmill Model X"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="serialNumber" className="block text-sm font-semibold text-slate-900 mb-1.5">Serial Number (Optional)</label>
                        <input type="text" name="serialNumber" id="serialNumber" placeholder="SN-12345678"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-semibold text-slate-900 mb-1.5">Current Status</label>
                        <select required name="status" id="status" defaultValue="OPERATIONAL"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white">
                            <option value="OPERATIONAL">Operational</option>
                            <option value="MAINTENANCE">In Maintenance</option>
                            <option value="BROKEN">Broken / Out of Order</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="lastMaintenance" className="block text-sm font-semibold text-slate-900 mb-1.5">Last Maintenance Date</label>
                        <input type="date" name="lastMaintenance" id="lastMaintenance"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label htmlFor="nextMaintenance" className="block text-sm font-semibold text-slate-900 mb-1.5">Next Maintenance Due</label>
                        <input type="date" name="nextMaintenance" id="nextMaintenance"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-semibold text-slate-900 mb-1.5">Notes (Optional)</label>
                    <textarea name="notes" id="notes" rows={3} placeholder="Any specific issues or service records..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white resize-none" />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/equipment" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Saving...' : 'Add Equipment'}
                </button>
            </div>
        </form>
    );
}
