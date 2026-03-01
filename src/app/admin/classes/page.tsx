import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Users, Clock, Plus } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/login');

    const classes = await prisma.classSchedule.findMany({
        include: {
            trainer: true,
            _count: {
                select: { attendances: true }
            }
        },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Class Schedule</h2>
                    <p className="text-slate-600 mt-1 text-sm">Manage upcoming fitness classes and attendance.</p>
                </div>
                <Link href="/admin/classes/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                    <Plus className="w-4 h-4" /> Schedule Class
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Classes Scheduled</h3>
                        <p className="text-slate-500 mb-6">Create a new class to start tracking attendance.</p>
                        <Link href="/admin/classes/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                            <Plus className="w-4 h-4" /> Schedule Class
                        </Link>
                    </div>
                ) : (
                    classes.map((cls) => {
                        const isPast = new Date(cls.endTime) < new Date();
                        const isFull = cls._count.attendances >= cls.capacity;

                        return (
                            <div key={cls.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${isPast ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-primary-300 hover:shadow-md'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${isPast ? 'bg-slate-100 text-slate-600' : isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {isPast ? 'COMPLETED' : isFull ? 'FULL' : 'UPCOMING'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-1">{cls.name}</h3>
                                <p className="text-sm text-slate-600 mb-4">{cls.trainer?.name || 'Unassigned Trainer'}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{new Date(cls.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>{new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span>{cls._count.attendances} / {cls.capacity} Enrolled</span>
                                    </div>
                                </div>

                                <Link href={`/admin/classes/${cls.id}`} className="block w-full text-center rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                                    View Details
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
