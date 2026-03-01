'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function StaffForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const isEdit = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(isEdit ? `/api/staff/${initialData.id}` : '/api/staff', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/admin/staff');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add staff member');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 mb-6">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <p className="text-sm leading-relaxed">
                    <strong>Note on permissions:</strong> This account will be created as an Administrator with full system access.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-1.5">Full Name</label>
                        <input required type="text" name="name" id="name" defaultValue={initialData?.name || ''} placeholder="Jane Doe"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-1.5">Email Address</label>
                        <input required type="email" name="email" id="email" defaultValue={initialData?.email || ''} placeholder="jane@fitflow.com"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1.5">{isEdit ? 'Change Password (Optional)' : 'Initial Password'}</label>
                        <input required={!isEdit} type="password" name="password" id="password" placeholder="••••••••" minLength={6}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-semibold text-slate-900 mb-1.5">Phone Number (Optional)</label>
                        <input type="tel" name="phone_number" id="phone_number" defaultValue={initialData?.phone_number || ''} placeholder="+1 (555) 000-0000"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                </div>

                <div className="hidden">
                    <input type="hidden" name="role" value="ADMIN" />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/staff" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Account'}
                </button>
            </div>
        </form>
    );
}
