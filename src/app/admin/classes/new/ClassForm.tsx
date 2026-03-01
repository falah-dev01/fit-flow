'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClassForm({ trainers }: { trainers: { id: string, name: string | null }[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/admin/classes');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to schedule class');
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
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-1.5">Class Name</label>
                    <input required type="text" name="name" id="name" placeholder="e.g. Morning Vinyasa Yoga"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-1.5">Description (Optional)</label>
                    <textarea name="description" id="description" rows={3} placeholder="What will members expect?"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white resize-none" />
                </div>
                <div>
                    <label htmlFor="trainerId" className="block text-sm font-semibold text-slate-900 mb-1.5">Assigned Trainer</label>
                    <select required name="trainerId" id="trainerId"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white">
                        <option value="">Select a trainer...</option>
                        {trainers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-semibold text-slate-900 mb-1.5">Start Date & Time</label>
                        <input required type="datetime-local" name="startTime" id="startTime"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-semibold text-slate-900 mb-1.5">End Date & Time</label>
                        <input required type="datetime-local" name="endTime" id="endTime"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                </div>
                <div>
                    <label htmlFor="capacity" className="block text-sm font-semibold text-slate-900 mb-1.5">Maximum Capacity</label>
                    <input required type="number" name="capacity" id="capacity" defaultValue={20} min={1} max={100}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/classes" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Scheduling...' : 'Schedule Class'}
                </button>
            </div>
        </form>
    );
}
