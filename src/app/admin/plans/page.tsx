import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Tag, Clock } from 'lucide-react';
import EditPlanModal from './EditPlanModal';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { monthlyFee: 'asc' },
        include: {
            _count: {
                select: { memberships: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Subscription Plans</h2>
                    <p className="text-slate-600 mt-1 text-sm">Create and manage your preset gym membership packages.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/plans/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Plus className="w-4 h-4" /> Add Plan
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${plan.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-50 text-slate-700 ring-slate-600/20'
                                }`}>
                                {plan.isActive ? 'Active' : 'Archived'}
                            </span>
                        </div>

                        <div className="space-y-1 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Entry Fee</span>
                                <span className="text-sm font-bold text-slate-900">₹{plan.entryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Monthly Subscription</span>
                                <span className="text-lg font-bold text-primary-600">₹{plan.monthlyFee.toFixed(2)}</span>
                            </div>
                        </div>

                        {plan.description && (
                            <p className="text-sm text-slate-600 mb-6 flex-grow">{plan.description}</p>
                        )}
                        {!plan.description && (
                            <div className="flex-grow"></div>
                        )}

                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-slate-400" /> Active Subscribers
                                </span>
                                <span className="font-bold text-slate-900">{plan._count.memberships}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-auto">
                            <EditPlanModal plan={plan} />
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-full rounded-xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-slate-400 transition-colors">
                        <Tag className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-sm font-semibold text-slate-900">No subscription plans</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new predefined pricing tier.</p>
                        <Link href="/admin/plans/new" className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Plan
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
