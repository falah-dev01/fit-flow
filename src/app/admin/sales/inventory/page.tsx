import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import RestockModal from './RestockModal';
import DeleteInventoryButton from './DeleteInventoryButton';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    // ...
    const items = await prisma.retailItem.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/admin/sales" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Point of Sale
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h2>
                    <p className="text-slate-600 mt-1 text-sm">Add or edit items available for over-the-counter purchase.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/sales/inventory/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <Plus className="w-4 h-4" /> Add Item
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 tracking-wider uppercase">
                                <th className="px-6 py-4 font-semibold">Item Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold">Stock Count</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{item.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${item.stockCount <= 5 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {item.stockCount} in stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <RestockModal
                                            itemId={item.id}
                                            itemName={item.name}
                                            currentStock={item.stockCount}
                                        />
                                        <DeleteInventoryButton
                                            itemId={item.id}
                                            itemName={item.name}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-slate-900">No items in inventory</p>
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
