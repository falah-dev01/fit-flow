'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ItemForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        data.price = parseFloat(data.price as string).toString();
        data.stockCount = parseInt(data.stockCount as string, 10).toString();

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/admin/sales/inventory');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add item');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-1.5">Item Name</label>
                    <input required type="text" name="name" id="name" placeholder="E.g. Whey Protein 1kg"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-1.5">Category</label>
                    <select required name="category" id="category" defaultValue="SUPPLEMENT"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white">
                        <option value="SUPPLEMENT">Supplement</option>
                        <option value="BEVERAGE">Beverage</option>
                        <option value="MERCHANDISE">Merchandise</option>
                        <option value="GEAR">Gear & Equipment</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-semibold text-slate-900 mb-1.5">Price (₹)</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-500 sm:text-sm">₹</span>
                            </div>
                            <input required type="number" step="0.01" min="0" name="price" id="price" placeholder="0.00"
                                className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="stockCount" className="block text-sm font-semibold text-slate-900 mb-1.5">Initial Stock Count</label>
                        <input required type="number" min="0" name="stockCount" id="stockCount" defaultValue={10}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/sales/inventory" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Saving...' : 'Add Item'}
                </button>
            </div>
        </form>
    );
}
