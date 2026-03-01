'use client';

import { useRouter } from 'next/navigation';

export default function PaymentActionForm({ paymentId, currentStatus }: { paymentId: string, currentStatus: string }) {
    const router = useRouter();

    const handleUpdate = async () => {
        const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
        await fetch('/api/payments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: paymentId, paymentStatus: newStatus }),
        });
        router.refresh();
    };

    if (currentStatus === 'PAID') {
        return (
            <button onClick={handleUpdate} className="text-zinc-500 hover:text-zinc-400 text-xs uppercase tracking-wider font-bold transition">
                Mark Unpaid
            </button>
        );
    }

    return (
        <button onClick={handleUpdate} className="text-emerald-500 hover:text-emerald-400 text-xs uppercase tracking-wider font-bold transition">
            Mark Paid
        </button>
    );
}
