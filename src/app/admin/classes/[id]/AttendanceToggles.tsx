'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AttendanceToggles({
    attendanceId,
    initialStatus
}: {
    attendanceId: string,
    initialStatus: string
}) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const updateStatus = async (newStatus: string) => {
        if (isLoading || newStatus === status) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/classes/attendance/${attendanceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => updateStatus('ATTENDED')}
                disabled={isLoading}
                title="Mark Present"
                className={`p-1.5 rounded-lg transition-colors ${status === 'ATTENDED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
            >
                <CheckCircle2 className="w-5 h-5" />
            </button>
            <button
                onClick={() => updateStatus('BOOKED')}
                disabled={isLoading}
                title="Mark Pending"
                className={`p-1.5 rounded-lg transition-colors ${status === 'BOOKED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                    }`}
            >
                <Clock className="w-5 h-5" />
            </button>
            <button
                onClick={() => updateStatus('CANCELLED')}
                disabled={isLoading}
                title="Mark Absent/Cancelled"
                className={`p-1.5 rounded-lg transition-colors ${status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                    }`}
            >
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
}
