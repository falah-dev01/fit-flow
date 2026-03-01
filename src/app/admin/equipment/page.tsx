import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import UpdateStatusModal from './UpdateStatusModal';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    // ... rest of the file ...
    const equipment = await prisma.equipment.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    const brokenCount = equipment.filter(e => e.status === 'BROKEN').length;
    const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Tracker</h2>
                    <p className="text-slate-600 mt-1 text-sm">Monitor gym machine health, maintenance logs, and breakages.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/equipment/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Plus className="w-4 h-4" /> Add Machine
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Operational</p>
                            <p className="text-2xl font-bold text-slate-900">{equipment.length - brokenCount - maintenanceCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">In Maintenance</p>
                            <p className="text-2xl font-bold text-slate-900">{maintenanceCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Out of Order</p>
                            <p className="text-2xl font-bold text-slate-900">{brokenCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 tracking-wider uppercase">
                                <th className="px-6 py-4 font-semibold">Equipment Machine</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Serial No.</th>
                                <th className="px-6 py-4 font-semibold">Next Maintenance</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {equipment.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        {item.name}
                                        {item.notes && <p className="text-xs text-slate-500 mt-1 font-normal truncate max-w-xs">{item.notes}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${item.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' :
                                            item.status === 'BROKEN' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.serialNumber || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'Unscheduled'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <UpdateStatusModal
                                            equipmentId={item.id}
                                            equipmentName={item.name}
                                            currentStatus={item.status}
                                            currentNotes={item.notes}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {equipment.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-900">No equipment tracked</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
