import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import AttendanceToggles from './AttendanceToggles';

export const dynamic = 'force-dynamic';

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const classSchedule = await prisma.classSchedule.findUnique({
        where: { id },
        include: {
            trainer: true,
            attendances: {
                include: { user: true },
                orderBy: { status: 'asc' }
            }
        }
    });

    if (!classSchedule) return notFound();

    const isPast = new Date(classSchedule.endTime) < new Date();
    const enrolledCount = classSchedule.attendances.length;
    const isFull = enrolledCount >= classSchedule.capacity;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/admin/classes" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Schedule
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{classSchedule.name}</h2>
                    <p className="text-slate-600 mt-1 text-sm">Instructor: {classSchedule.trainer?.name || 'Unassigned'}</p>
                </div>
                <div className="flex gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${isPast ? 'bg-slate-100 text-slate-700 ring-slate-500/20' : isFull ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                        {isPast ? 'COMPLETED' : isFull ? 'FULL' : 'UPCOMING'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 mb-4">Class Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Date</p>
                                    <p className="text-sm text-slate-500">{new Date(classSchedule.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Time</p>
                                    <p className="text-sm text-slate-500">{new Date(classSchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(classSchedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Capacity</p>
                                    <p className="text-sm text-slate-500">{enrolledCount} / {classSchedule.capacity} Enrolled</p>
                                </div>
                            </div>
                            {classSchedule.description && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm font-medium text-slate-900 mb-1">Description</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{classSchedule.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roster Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Class Roster</h3>
                                <p className="text-sm text-slate-500 mt-1">Attendees signed up for this session</p>
                            </div>
                            {/* Simple form or endpoint would go here to manually add user */}
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 tracking-wider uppercase">
                                        <th className="px-6 py-4 font-semibold">Member</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classSchedule.attendances.map((attendance) => (
                                        <tr key={attendance.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                                                        {attendance.user.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{attendance.user.name}</p>
                                                        <p className="text-xs text-slate-500">{attendance.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${attendance.status === 'ATTENDED' ? 'bg-emerald-100 text-emerald-800' :
                                                    attendance.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {attendance.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AttendanceToggles
                                                    attendanceId={attendance.id}
                                                    initialStatus={attendance.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                    {classSchedule.attendances.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center">
                                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-slate-900">No attendees yet</p>
                                                <p className="text-sm text-slate-500 mt-1">Members can book this class from their dashboard.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
