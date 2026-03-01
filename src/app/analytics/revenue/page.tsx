import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, CreditCard, DollarSign, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RevenueAnalyticsPage() {
    const paidInvoices = await prisma.payment.findMany({ where: { paymentStatus: 'PAID' } });
    const collectedRevenue = paidInvoices.reduce((sum, p) => sum + p.amount, 0);

    const unpaidInvoices = await prisma.payment.findMany({ where: { paymentStatus: 'UNPAID' } });
    const pendingRevenue = unpaidInvoices.reduce((sum, p) => sum + p.amount, 0);

    const totalInvoices = paidInvoices.length + unpaidInvoices.length;
    const collectionRate = totalInvoices > 0 ? ((paidInvoices.length / totalInvoices) * 100).toFixed(1) : '0.0';

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Global Overview
                </Link>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial & Revenue Projections</h1>
                        <p className="text-slate-500 mt-1">Cash flow analysis, recovery rates, and expected MRR.</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition">
                        <DollarSign className="w-4 h-4" /> Export CSV Report
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* YTD Collected */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-emerald-600 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Total Collected Value</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">₹{collectedRevenue.toLocaleString()}</h3>
                    </div>

                    {/* Pending Dues */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-amber-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-amber-600 bg-amber-50 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Outstanding Invoices</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 text-amber-600">₹{pendingRevenue.toLocaleString()}</h3>
                    </div>

                    {/* Collection Rate */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-slate-700 bg-slate-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Invoice Success Rate</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{collectionRate}%</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Projected Monthly Recurring Revenue (MRR)</h3>
                    </div>
                    <div className="p-6">
                        <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-col gap-2 relative overflow-hidden">
                            {/* Decorative line chart simulation */}
                            <svg className="absolute bottom-0 w-full h-32 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0,100 L0,50 Q25,20 50,70 T100,30 L100,100 Z" fill="#10b981" />
                            </svg>
                            <DollarSign className="w-8 h-8 text-emerald-400 relative z-10" />
                            <p className="text-slate-500 font-medium relative z-10">MRR growth charts will appear here after the first billing cycle.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
