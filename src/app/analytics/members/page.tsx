import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, UserX, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MembersAnalyticsPage() {
    const totalMembers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const activePlans = await prisma.membership.count({ where: { status: 'ACTIVE' } });
    const expiredPlans = await prisma.membership.count({ where: { status: 'EXPIRED' } });

    // Calculate retention rate (rough estimate based on current active vs total)
    const retentionRate = totalMembers > 0 ? ((activePlans / totalMembers) * 100).toFixed(1) : '0.0';

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Global Overview
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Member Demographics & Retention</h1>
                    <p className="text-slate-500 mt-1">Detailed breakdown of your client base subscriptions and growth.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <Users className="w-5 h-5 text-blue-500 mb-3" />
                        <p className="text-sm font-medium text-slate-500">Total Database Size</p>
                        <h3 className="text-2xl font-bold text-slate-900">{totalMembers}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                        <UserCheck className="w-5 h-5 text-emerald-500 mb-3" />
                        <p className="text-sm font-medium text-slate-500">Currently Active Clients</p>
                        <h3 className="text-2xl font-bold text-slate-900">{activePlans}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
                        <UserX className="w-5 h-5 text-rose-500 mb-3" />
                        <p className="text-sm font-medium text-slate-500">Lapsed / Expired Plans</p>
                        <h3 className="text-2xl font-bold text-slate-900">{expiredPlans}</h3>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white">
                        <Clock className="w-5 h-5 text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-400">Current Retention Rate</p>
                        <h3 className="text-2xl font-bold">{retentionRate}%</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Recent Member Cohorts</h3>
                    </div>
                    <div className="p-6">
                        <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-col gap-2">
                            <Users className="w-8 h-8 text-slate-300" />
                            <p className="text-slate-500 font-medium">Cohort visualizations will appear here as the database grows.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
