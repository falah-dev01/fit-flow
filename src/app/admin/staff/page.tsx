import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, Mail, Phone, CalendarDays } from 'lucide-react';
import RemoveStaffButton from './RemoveStaffButton';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    // ... rest of the imports and setup ...
    const staff = await prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'TRAINER'] }
        },
        include: {
            _count: {
                select: { classesTaught: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Staff Directory</h2>
                    <p className="text-slate-600 mt-1 text-sm">Manage administrators and fitness trainers.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            placeholder="Search staff..."
                        />
                    </div>
                    <Link href="/admin/staff/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Plus className="w-4 h-4" /> Add Staff
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(person => (
                    <div key={person.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                {person.name?.charAt(0) || 'S'}
                            </div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${person.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                }`}>
                                <ShieldCheck className="w-3 h-3" /> {person.role}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{person.name}</h3>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{person.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{person.phone_number || 'No phone number'}</span>
                            </div>
                            {person.role === 'TRAINER' && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span>{person._count.classesTaught} Classes Assigned</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-4">
                            <Link
                                href={`/admin/staff/${person.id}/edit`}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Edit
                            </Link>
                            <RemoveStaffButton staffId={person.id} staffName={person.name || ''} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
