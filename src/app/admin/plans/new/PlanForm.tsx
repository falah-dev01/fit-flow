'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlanForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Format numeric fields
        data.entryFee = parseFloat(data.entryFee as string).toString();
        data.monthlyFee = parseFloat(data.monthlyFee as string).toString();
        data.isActive = data.isActive === 'on' ? 'true' : 'false';

        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/admin/plans');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create plan');
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
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-1.5">Plan Name</label>
                    <input required type="text" name="name" id="name" placeholder="E.g. Gold Annual Membership"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm  focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="entryFee" className="block text-sm font-semibold text-slate-900 mb-1.5">Entry Fee (₹)</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-500 sm:text-sm">₹</span>
                            </div>
                            <input required type="number" step="0.01" min="0" name="entryFee" id="entryFee" placeholder="200.00" defaultValue="200"
                                className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white" />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">One-time registration fee</p>
                    </div>
                    <div>
                        <label htmlFor="monthlyFee" className="block text-sm font-semibold text-slate-900 mb-1.5">Monthly Fee (₹)</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-500 sm:text-sm">₹</span>
                            </div>
                            <input required type="number" step="0.01" min="0" name="monthlyFee" id="monthlyFee" placeholder="700.00" defaultValue="700"
                                className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white" />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Recurring monthly subscription</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-1.5">Description (Optional)</label>
                    <textarea name="description" id="description" rows={3} placeholder="Describe what benefits are included in this plan..."
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white resize-none" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                            />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label htmlFor="isActive" className="font-semibold text-slate-900">Make plan active immediately</label>
                            <p className="text-slate-500">Active plans can be selected when adding or editing members.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/plans" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Saving...' : 'Create Plan'}
                </button>
            </div>
        </form>
    );
}
