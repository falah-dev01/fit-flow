import Link from 'next/link';
import { ArrowLeft, BarChart3, Activity, Clock, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function OperationsAnalyticsPage() {
    // Simulated operational data for frontend mapping
    const peakHours = "17:00 - 19:30";
    const capacityCurrent = "68%";
    const maintenanceAlerts = 2;

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Global Overview
                </Link>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Facility Operations & Load</h1>
                        <p className="text-slate-500 mt-1">Real-time floor capacity, peak hour mapping, and system health.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Facility Capacity */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-blue-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Live</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Current Floor Capacity</p>
                        <div className="mt-1 flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900">{capacityCurrent}</h3>
                            <span className="text-sm text-slate-500 font-medium">/ 150 Max</span>
                        </div>
                    </div>

                    {/* Peak Hours */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-indigo-600 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Predicted Peak Window</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-2">{peakHours}</h3>
                    </div>

                    {/* Maintenance */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-t-4 border-t-rose-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 text-rose-600 bg-rose-50 rounded-lg flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Needs Review</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Active Maintenance Tickets</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{maintenanceAlerts}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">24-Hour Utilization Heatmap</h3>
                        <BarChart3 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-6">
                        <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-end justify-around px-4 pb-4 pt-10 relative">
                            {/* Decorative Heatmap Bars */}
                            {[30, 20, 10, 5, 20, 60, 80, 95, 85, 50, 40, 60, 75, 40, 20].map((height, i) => (
                                <div key={i} className="w-full mx-1 bg-blue-100 rounded-t-sm relative group cursor-pointer transition-all hover:bg-blue-300" style={{ height: `${height}%` }}>
                                    <div className={`absolute bottom-0 w-full rounded-t-sm ${height > 80 ? 'bg-blue-600' : height > 50 ? 'bg-blue-400' : height > 20 ? 'bg-blue-300' : 'bg-blue-200'}`} style={{ height: '100%' }}></div>
                                </div>
                            ))}
                            <span className="absolute top-4 right-4 text-xs font-medium text-slate-400">Simulated 24h Distribution</span>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
