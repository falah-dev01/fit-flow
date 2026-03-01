'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, PackagePlus } from 'lucide-react';

export default function RestockModal({
    itemId,
    itemName,
    currentStock
}: {
    itemId: string,
    itemName: string,
    currentStock: number
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('10');

    const handleRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/inventory/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restockAmount: amount }),
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert('Failed to restock item');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary-600 hover:text-primary-700 font-semibold mr-4"
            >
                Restock
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-left">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <PackagePlus className="w-5 h-5 text-primary-600" />
                                Restock Item
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRestock} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Add more stock for <strong>{itemName}</strong>. Current stock: {currentStock}.
                                </p>
                                <label htmlFor="amount" className="block text-sm font-semibold text-slate-900 mb-2">Quantity to Add</label>
                                <input
                                    required
                                    type="number"
                                    id="amount"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                                />
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Updating...' : 'Confirm Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
