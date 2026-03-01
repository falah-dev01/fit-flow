'use client';

import { FileEdit, Trash2, FileDown, Filter, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export function EditMemberButton({ id }: { id: string }) {
    return (
        <Link href={`/admin/members/${id}/edit`} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition" title="Edit Member">
            <FileEdit className="w-4 h-4" />
        </Link>
    );
}

export function DeleteMemberButton({ id }: { id: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
            return;
        }
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete member');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred while deleting the member');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button disabled={isDeleting} onClick={handleDelete} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50" title="Delete Member">
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

export function RenewMemberButton({ id }: { id: string }) {
    const router = useRouter();
    const [isRenewing, setIsRenewing] = useState(false);

    const handleRenew = async () => {
        const choice = window.prompt(
            'Manual Renewal Options:\n1. Generate Unpaid Invoice Only\n2. Renew & Mark as Paid Automatically\n\nEnter 1 or 2:'
        );

        if (!choice || (choice !== '1' && choice !== '2')) return;

        let paymentMethod = 'CASH';
        let splitCash = 0;
        let splitGpay = 0;

        if (choice === '2') {
            const methodChoice = window.prompt(
                'Select Payment Method:\n1. Cash\n2. G-Pay (UPI)\n3. Credit/Debit Card\n4. Split Payment\n\nEnter 1, 2, 3, or 4:'
            );
            if (methodChoice === '2') paymentMethod = 'GPAY';
            else if (methodChoice === '3') paymentMethod = 'CARD';
            else if (methodChoice === '4') {
                paymentMethod = 'SPLIT';
                const cashInput = window.prompt('Enter Cash Amount (₹):');
                const gpayInput = window.prompt('Enter G-Pay Amount (₹):');
                splitCash = parseFloat(cashInput || '0') || 0;
                splitGpay = parseFloat(gpayInput || '0') || 0;
            }
        }

        setIsRenewing(true);
        try {
            const res = await fetch(`/api/members/${id}/renew`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    markAsPaid: choice === '2',
                    paymentMethod,
                    splitCash,
                    splitGpay
                })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Successfully renewed member subscription!');
                router.refresh();
            } else {
                alert(`Failed to renew: ${data.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred during renewal.');
        } finally {
            setIsRenewing(false);
        }
    };

    return (
        <button
            disabled={isRenewing}
            onClick={handleRenew}
            className="rounded-md p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition disabled:opacity-50"
            title="Renew Subscription"
        >
            <RefreshCw className={`w-4 h-4 ${isRenewing ? 'animate-spin' : ''}`} />
        </button>
    );
}

export function ExportButton({ type = 'payments' }: { type?: string }) {
    return (
        <a href={`/api/export/csv?type=${type}`} download className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
            <FileDown className="w-4 h-4" /> Export Report
        </a>
    );
}



export function ViewInvoiceButton({ id }: { id: string }) {
    return (
        <Link href={`/admin/payments/${id}`} className="text-primary-600 hover:text-primary-700 hover:underline">
            View Invoice
        </Link>
    );
}
