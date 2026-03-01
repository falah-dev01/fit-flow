import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ClassForm from './ClassForm';

export const dynamic = 'force-dynamic';

export default async function NewClassPage() {
    const trainers = await prisma.user.findMany({
        where: { role: 'TRAINER' },
        select: { id: true, name: true }
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/classes" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Schedule
                </Link>
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Schedule New Class</h2>
                <p className="text-slate-600 mt-1 text-sm">Add a new session to the fitness calendar.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <ClassForm trainers={trainers} />
            </div>
        </div>
    );
}
