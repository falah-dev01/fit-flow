import { headers } from 'next/headers';
import Link from 'next/link';
import { Activity, Users, CreditCard, TrendingUp, AlertCircle, PieChart } from 'lucide-react';
import RevenueChart from '@/components/analytics/RevenueChart';
import PlanDistributionChart from '@/components/analytics/PlanDistributionChart';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
    try {
        const h = await headers();
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = h.get('host');

        const res = await fetch(`${protocol}://${host}/api/analytics`, {
            cache: 'no-store',
            headers: {
                cookie: h.get('cookie') || ''
            }
        });

        if (!res.ok) throw new Error('Failed to fetch analytics');
        return await res.json();
    } catch (e) {
        console.error(e);
        return {
            revenueData: [],
            planDistributionData: [],
            alerts: [],
            activities: []
        };
    }
}

export default async function DashboardOverviewPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/admin/classes');

    const data = await getAnalyticsData();

    // Summarize Top-level Metrics from the payload arrays
    const totalMembers = data.planDistributionData.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const mtdRevenue = data.revenueData.length > 0 ? data.revenueData[data.revenueData.length - 1].Total : 0;
    const unpaidAlerts = data.alerts.filter((a: any) => a.badge === 'Overdue').length;

    const metrics = [
        { title: 'Active Members', value: totalMembers, change: '', icon: Users },
        { title: 'Active Plans', value: data.planDistributionData.length, change: '', icon: Activity },
        { title: 'Pending Dues', value: unpaidAlerts, change: unpaidAlerts > 0 ? 'Needs Attention' : 'All Clear', icon: CreditCard },
        { title: 'Revenue (Mtd)', value: `₹${mtdRevenue}`, change: '', icon: TrendingUp },
    ];

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Analytics Overview</h2>
                    <p className="text-slate-600 mt-1 text-sm">Real-time statistics covering your gym's revenue, members, and essential tasks.</p>
                </div>
                <div className="flex gap-3">
                    <a href="/api/export/csv?type=payments" download className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center">
                        Export Report
                    </a>
                    <Link href="/admin/members/new" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition flex items-center justify-center">
                        New Member
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-600">{m.title}</p>
                            <m.icon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                            <span className={`text-xs font-semibold ${m.change === 'Needs Attention' ? 'text-red-600' : 'text-green-600'}`}>
                                {m.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue Highlights - Spans 2 columns */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        6-Month Revenue History
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <RevenueChart data={data.revenueData} />
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-emerald-500" />
                        Active Subscriptions
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <PlanDistributionChart data={data.planDistributionData} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Needs Attention Panel */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Actionable Alerts
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        {data.alerts.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm">
                                All clear! No overdue payments or expiring plans.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-500 tracking-wider uppercase">
                                        <th className="pb-3 font-semibold w-1/3">Member</th>
                                        <th className="pb-3 font-semibold">Issue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.alerts.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-3 text-sm font-medium text-slate-900">{item.name}</td>
                                            <td className="py-3 text-sm text-slate-600 flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${item.badge === 'Warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.badge}
                                                </span>
                                                {item.issue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Activity Mini */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[400px] overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4">
                        {data.activities.length === 0 ? (
                            <div className="text-slate-500 text-sm text-center py-4">No recent activity</div>
                        ) : (
                            data.activities.map((act: any, idx: number) => (
                                <div key={act.id} className="flex gap-4 items-start relative">
                                    {idx !== data.activities.length - 1 && <div className="absolute left-1.5 top-5 bottom-[-16px] w-px bg-slate-200"></div>}
                                    <div className={`w-3 h-3 rounded-full mt-1 relative z-10 border-2 border-white ${act.type === 'signup' ? 'bg-emerald-400' : 'bg-indigo-400'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm text-slate-900">
                                            <span className="font-semibold">{act.user}</span> {act.action.toLowerCase()}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {new Date(act.date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )))}
                    </div>
                </div>
            </div>

        </div>
    );
}
