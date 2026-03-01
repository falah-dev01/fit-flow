import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MemberForm from './MemberForm';

export const dynamic = 'force-dynamic';

export default async function NewMemberPage() {
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyFee: 'asc' }
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col gap-2">
                <Link href="/admin/members" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Members
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Member</h2>
                    <p className="text-slate-600 text-sm mt-1">Provision a new account and initial tracking records.</p>
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
                <MemberForm plans={plans} />
            </div>
        </div>
    );
}
