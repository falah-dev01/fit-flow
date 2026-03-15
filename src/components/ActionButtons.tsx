'use client';

import { FileEdit, Trash2, FileDown, Filter, RefreshCw, IndianRupee, Download } from 'lucide-react';
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

export function DownloadReceiptButton({ payment }: { payment: any }) {
    const handleDownload = async () => {
        // We'll use a dynamic import for jspdf to avoid build errors if not installed yet
        try {
            // @ts-ignore
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            const primaryMembership = payment.membership;
            const userName = primaryMembership?.user?.name || 'Customer';
            const date = new Date(payment.updatedAt || payment.createdAt).toLocaleDateString();
            const invId = `INV-${payment.id.substring(0, 6).toUpperCase()}`;

            // Header
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59); // Slate 800
            doc.text('FITFLOW GYM', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.text('Official Payment Receipt', 105, 28, { align: 'center' });

            // Divider
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.line(20, 35, 190, 35);

            // Details
            doc.setFontSize(12);
            doc.text(`Receipt To: ${userName}`, 20, 50);
            doc.text(`Date: ${date}`, 150, 50);
            doc.text(`Invoice ID: ${invId}`, 20, 60);
            doc.text(`Status: PAID`, 150, 60);

            // Table Header
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.rect(20, 75, 170, 10, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Description', 25, 81.5);
            doc.text('Amount', 160, 81.5);

            // Table Body
            doc.setFont('helvetica', 'normal');
            const desc = payment.description || 'Monthly Membership Subscription';
            doc.text(desc, 25, 95);
            doc.text(`INR ${payment.amount.toFixed(2)}`, 160, 95);

            // Total
            doc.line(20, 105, 190, 105);
            doc.setFont('helvetica', 'bold');
            doc.text('GRAND TOTAL', 25, 115);
            doc.text(`INR ${payment.amount.toFixed(2)}`, 160, 115);

            // Payment Method
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Method: ${payment.paymentMethod || 'CASH'}`, 25, 130);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.text('Thank you for being a valued member of FitFlow Gym!', 105, 150, { align: 'center' });
            doc.text('This is a computer-generated receipt.', 105, 155, { align: 'center' });

            doc.save(`Receipt_${invId}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('PDF Generator (jspdf) is not installed. Please ask the developer to run: npm install jspdf');
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="rounded-md p-1.5 text-primary-600 hover:bg-primary-50 transition flex items-center gap-1 text-xs font-semibold"
            title="Download PDF Receipt"
        >
            <Download className="w-3.5 h-3.5" /> Receipt
        </button>
    );
}


export function CustomFeeButton({ memberId }: { memberId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;
        setLoading(true);

        try {
            const res = await fetch('/api/payments/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    membershipId: memberId, // For simplicity using memberId as membership proxy for now
                    amount,
                    description,
                    dueDate: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                alert('Fee Added successfully!');
                setIsOpen(false);
                setAmount('');
                setDescription('');
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to add fee'}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-md p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                title="Add Custom Fee"
            >
                <IndianRupee className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Custom Fee</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Locker Rent, Late Fee"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
                                >
                                    {loading ? 'Adding...' : 'Add Fee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

