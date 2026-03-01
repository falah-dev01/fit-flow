import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from './EquipmentForm';

export const dynamic = 'force-dynamic';

export default function NewEquipmentPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/equipment" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Equipment
                </Link>
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Add Machine to Registry</h2>
                <p className="text-slate-600 mt-1 text-sm">Register a new piece of gym equipment to track its lifecycle.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <EquipmentForm />
            </div>
        </div>
    );
}
