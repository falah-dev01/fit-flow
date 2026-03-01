'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function MemberForm({ plans }: { plans: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', phone_number: '', planId: '', paymentMethod: 'CASH', splitCash: '', splitGpay: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');

        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/members');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to add member');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text" required
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        placeholder="Alex Johnson"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                        type="tel"
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        placeholder="+1234567890"
                        value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Required for automated billing alerts.</p>
                </div>

                <div className="sm:col-span-2 pt-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gym Subscription Plan</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                            value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })}
                        >
                            <option value="">No Plan (Pending Setup)</option>
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - Entry: ₹{plan.entryFee.toFixed(2)} + Monthly: ₹{plan.monthlyFee.toFixed(2)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1.5">Assigning a plan immediately activates the membership and sets the billing cycle.</p>
                    </div>

                    {formData.planId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Payment Method</label>
                                <select
                                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="GPAY">G-Pay (UPI)</option>
                                    <option value="CARD">Credit/Debit Card</option>
                                    <option value="SPLIT">Split Payment</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1.5">How they paid the Entry + First Month fee.</p>
                            </div>

                            {formData.paymentMethod === 'SPLIT' && (
                                <div className="sm:col-span-2 grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cash Component (₹)</label>
                                        <input
                                            type="number" min="0" step="1" required
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                            value={formData.splitCash} onChange={e => setFormData({ ...formData, splitCash: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">G-Pay Component (₹)</label>
                                        <input
                                            type="number" min="0" step="1" required
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                            value={formData.splitGpay} onChange={e => setFormData({ ...formData, splitGpay: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end gap-3">
                <Link href="/admin/members" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? 'Provisioning...' : <><UserPlus className="w-4 h-4" /> Provision Member</>}
                </button>
            </div>
        </form>
    );
}
