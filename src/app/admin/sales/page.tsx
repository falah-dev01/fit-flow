import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Store, Package, Receipt, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/login');

    const recentSales = await prisma.retailSale.findMany({
        include: { retailItem: true, soldBy: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    const itemsCount = await prisma.retailItem.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await prisma.retailSale.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Point of Sale</h2>
                    <p className="text-slate-600 mt-1 text-sm">Log retail purchases and manage inventory.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/sales/inventory" className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50 transition">
                        <Package className="w-4 h-4" /> Manage Inventory
                    </Link>
                    <Link href="/admin/sales/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Plus className="w-4 h-4" /> Log Sale
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Receipt className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600">Today's Retail Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">₹{(todaySales._sum.totalAmount || 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Store className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Inventory Items</p>
                            <p className="text-2xl font-bold text-slate-900">{itemsCount} in stock</p>
                        </div>
                    </div>
                    <Link href="/admin/sales/inventory" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        View <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Recent Sales</h3>
                    <p className="text-sm text-slate-500 mt-1">The last 20 retail transactions.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 tracking-wider uppercase">
                                <th className="px-6 py-4 font-semibold">Item</th>
                                <th className="px-6 py-4 font-semibold">Qty</th>
                                <th className="px-6 py-4 font-semibold">Total</th>
                                <th className="px-6 py-4 font-semibold">Time</th>
                                <th className="px-6 py-4 font-semibold">Staff</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{sale.retailItem.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{sale.quantity}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{sale.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{sale.soldBy.name}</td>
                                </tr>
                            ))}
                            {recentSales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No sales logged yet.
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
