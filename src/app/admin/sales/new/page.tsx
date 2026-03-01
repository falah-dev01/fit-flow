import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SaleForm from './SaleForm';

export const dynamic = 'force-dynamic';

export default async function NewSalePage() {
    // Only fetch items that are in stock
    const items = await prisma.retailItem.findMany({
        where: { stockCount: { gt: 0 } },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/sales" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Point of Sale
                </Link>
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Log Retail Sale</h2>
                <p className="text-slate-600 mt-1 text-sm">Record an over-the-counter transaction.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <SaleForm items={items} />
            </div>
        </div>
    );
}
