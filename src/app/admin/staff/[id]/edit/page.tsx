import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StaffForm from '../../new/StaffForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const staff = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, phone_number: true, role: true }
    });

    if (!staff || (staff.role !== 'ADMIN' && staff.role !== 'TRAINER')) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col gap-2">
                <Link href="/admin/staff" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Staff
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Staff Profile</h2>
                    <p className="text-slate-600 text-sm mt-1">Update contact information and system permissions.</p>
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
                <StaffForm initialData={staff} />
            </div>
        </div>
    );
}
