import prisma from '@/lib/prisma';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, CreditCard, Activity, ArrowRight } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const session = await getSession();
    if (session && (session.role === 'ADMIN' || session.role === 'TRAINER')) {
        redirect('/admin');
    }

    // Analytics Data Fetching
    const totalMembers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const activeMembers = await prisma.membership.count({ where: { status: 'ACTIVE' } });

    const unpaidInvoices = await prisma.payment.findMany({ where: { paymentStatus: 'UNPAID' } });
    const totalPendingRevenue = unpaidInvoices.reduce((sum, payment) => sum + payment.amount, 0);

    const paidInvoices = await prisma.payment.findMany({ where: { paymentStatus: 'PAID' } });
    const totalCollectedRevenue = paidInvoices.reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary-600" />
                        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 hover:text-primary-600 transition-colors">
                            FitFlow<span className="text-primary-600">Analytics</span>
                        </Link>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">
                            Staff Login
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Facility Overview</h1>
                        <p className="text-slate-500 mt-1">Real-time performance metrics and operational capacity.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Systems Operational
                    </div>
                </div>

                {/* Primary Metric KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* KPI 1 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% MoM</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Registered Members</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalMembers}</h3>
                        </div>
                    </div>

                    {/* KPI 2 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+4% MoM</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Retained Plans</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeMembers}</h3>
                        </div>
                    </div>

                    {/* KPI 3 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+18% MoM</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Collected Revenue (YTD)</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalCollectedRevenue.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* KPI 4 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Action Required</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Recoverable Dues</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1 text-amber-600">${totalPendingRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis Section Navigation */}
                <h2 className="text-xl font-bold text-slate-900 mb-4 mt-12">Detailed Department Analysis</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

                    <Link href="/login" className="group block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-primary-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors text-slate-700 group-hover:text-primary-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Member Demographics & Retention</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Deep dive into joining cohorts, churn rates, active hours, and facility utilization heatmaps.
                        </p>
                    </Link>

                    <Link href="/login" className="group block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-primary-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors text-slate-700 group-hover:text-primary-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Financial & Revenue Projections</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Analyze MRR (Monthly Recurring Revenue), payment default probability, and lifetime value (LTV).
                        </p>
                    </Link>

                    <Link href="/login" className="group block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-primary-500 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors text-slate-700 group-hover:text-primary-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Equipment & Operations Load</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Review peak capacity times, maintenance schedules, and biometric entry logs for security audits.
                        </p>
                    </Link>

                </div>
            </div>
        </main>
    );
}
