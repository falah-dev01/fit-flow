'use client';

import { useState } from 'react';
import { Search, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ViewInvoiceButton, ExportButton, DownloadReceiptButton } from '@/components/ActionButtons';

export default function PaymentsTableClient({ initialPayments }: { initialPayments: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Payments');

    const tabs = ['All Payments', 'Paid', 'Unpaid', 'Overdue'];

    // Filter logic
    const filteredPayments = initialPayments.filter(payment => {
        const memberName = payment.membership?.user?.name || '';
        const invoiceId = payment.id.substring(0, 6).toUpperCase();
        const isOverdue = payment.paymentStatus === 'UNPAID' && new Date(payment.dueDate) < new Date();

        // 1. Search Query
        const matchesSearch =
            memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoiceId.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // 2. Tab Filter
        if (activeTab === 'All Payments') return true;

        if (activeTab === 'Paid') return payment.paymentStatus === 'PAID';
        if (activeTab === 'Unpaid') return payment.paymentStatus === 'UNPAID' && !isOverdue;
        if (activeTab === 'Overdue') return isOverdue;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Dues</h2>
                    <p className="text-slate-600 text-sm mt-1">Monitor revenue, track pending invoices, and manage collections.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search invoices or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
                        />
                    </div>
                    <ExportButton />
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        {tab} {tab === 'All Payments' && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{initialPayments.length}</span>}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice / Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredPayments.map((payment: any) => {
                                const isOverdue = payment.paymentStatus === 'UNPAID' && new Date(payment.dueDate) < new Date();
                                return (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                                    {payment.membership?.user?.name ? payment.membership.user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{payment.membership?.user?.name || 'Unnamed'}</div>
                                                    <div className="text-sm text-slate-500 font-mono">INV-{payment.id.substring(0, 6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-900">₹{payment.amount.toFixed(2)}</div>
                                            <div className="text-xs text-slate-500">{payment.description || 'Monthly Fee'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {payment.paymentStatus === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                                </span>
                                            ) : isOverdue ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Overdue
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {new Date(payment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {payment.paymentStatus === 'PAID' && <DownloadReceiptButton payment={payment} />}
                                                <ViewInvoiceButton id={payment.id} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <FileDown className="mx-auto h-12 w-12 text-slate-300" />
                                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No payments found</h3>
                                        <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
