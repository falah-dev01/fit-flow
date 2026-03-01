'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save } from 'lucide-react';

export default function EditMemberForm({ user, plans }: { user: any, plans: any[] }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: user.name,
        phone_number: user.phone_number,
        planId: user.planId
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError('');

        try {
            const res = await fetch(`/api/members/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/members');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update member');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
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
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                        type="tel"
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                </div>
                <div className="sm:col-span-2 pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gym Subscription Plan</label>
                    <select
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
                        value={formData.planId || ''} onChange={e => setFormData({ ...formData, planId: e.target.value })}
                    >
                        <option value="">No Plan / Manual Override</option>
                        {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} - Entry: ₹{plan.entryFee.toFixed(2)} + Monthly: ₹{plan.monthlyFee.toFixed(2)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1.5">Changing the plan here will immediately cycle their billing dates and status to active.</p>
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end gap-3">
                <Link href="/admin/members" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm">
                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>
        </form>
    );
}
