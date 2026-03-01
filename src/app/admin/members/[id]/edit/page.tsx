import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditMemberForm from './EditMemberForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: { memberships: true }
    });

    if (!user) {
        notFound();
    }

    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyFee: 'asc' }
    });

    // Extract current planId if any
    const currentPlanId = user.memberships?.[0]?.planId || '';

    const initialData = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        planId: currentPlanId
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col gap-2">
                <Link href="/admin/members" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Members
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Member Profile</h2>
                    <p className="text-slate-600 text-sm mt-1">Update contact information and subscription plan.</p>
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <EditMemberForm user={initialData} plans={plans} />
            </div>
        </div>
    );
}
