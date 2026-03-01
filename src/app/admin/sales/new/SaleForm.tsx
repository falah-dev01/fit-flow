'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SaleForm({ items }: { items: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const selectedItem = items.find(i => i.id === selectedItemId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ retailItemId: selectedItemId, quantity }),
            });

            if (res.ok) {
                router.push('/admin/sales');
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to log sale');
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
                    <label htmlFor="retailItemId" className="block text-sm font-semibold text-slate-900 mb-1.5">Select Item</label>
                    <select required name="retailItemId" id="retailItemId"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white"
                        value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
                        <option value="">Choose a product from inventory...</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} (₹{item.price.toFixed(2)} - {item.stockCount} in stock)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-semibold text-slate-900 mb-1.5">Quantity</label>
                        <input required type="number" min="1" max={selectedItem?.stockCount || 100} name="quantity" id="quantity"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none transition-shadow bg-slate-50 focus:bg-white"
                            value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-1.5">Total Amount</label>
                        <div className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm bg-slate-100 text-slate-700 font-bold">
                            ₹{((selectedItem?.price || 0) * quantity).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/admin/sales" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={isLoading || !selectedItemId || (selectedItem && quantity > selectedItem.stockCount)}
                    className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2">
                    {isLoading ? 'Processing...' : 'Complete Sale'}
                </button>
            </div>
        </form>
    );
}
