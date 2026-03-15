import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { membership: { include: { user: true } } }
    });

    if (!payment) return notFound();

    const isOverdue = payment.paymentStatus === 'UNPAID' && new Date(payment.dueDate) < new Date();

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <Link href="/admin/payments" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Payments
                </Link>
                {/* A purely functional client component isn't strictly needed for window.print, but we'll use an inline script trick or a tiny client wrapper if needed. A simple button with onClick isn't valid in Server Component, so we use a link to trigger print via script, or just leave it for user standard OS print for now. Actually, we'll just instruct the user to press command+P for now. */}
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Printer className="w-4 h-4 inline mr-2" /> Press Ctrl+P to Print
                </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
                <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">FitFlow.</h1>
                        <p className="text-sm text-slate-500">123 Fitness Ave, Suite 100</p>
                        <p className="text-sm text-slate-500">contact@fitflow.com</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-300">INVOICE</h2>
                        <p className="text-sm font-mono font-medium text-slate-900 mt-1">INV-{payment.id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-slate-500 mt-2">Issued: {new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex justify-between items-start mb-12">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                        <p className="text-base font-bold text-slate-900">{payment.membership.user.name}</p>
                        <p className="text-sm text-slate-600">{payment.membership.user.email}</p>
                        <p className="text-sm text-slate-600">{payment.membership.user.phone_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                        {payment.paymentStatus === 'PAID' ? (
                            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" /> PAID
                            </div>
                        ) : isOverdue ? (
                            <div className="inline-flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg">
                                <AlertCircle className="w-5 h-5" /> OVERDUE
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">
                                PENDING
                            </div>
                        )}
                        <p className="text-sm font-medium text-slate-600 mt-2">
                            Due on: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <table className="w-full text-left border-collapse mb-12">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-3 text-sm font-semibold text-slate-900">Description</th>
                            <th className="py-3 text-sm font-semibold text-slate-900 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-4">
                                <p className="text-sm font-medium text-slate-900">{payment.description || 'Monthly Gym Membership Fee'}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {payment.description ? 'Custom charge or manual fee collection.' : 'Access to all facilities and standard classes.'}
                                </p>
                            </td>
                            <td className="py-4 text-right align-top">
                                <p className="text-sm font-medium text-slate-900">₹{payment.amount.toFixed(2)}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end border-t-2 border-slate-200 pt-6">
                    <div className="w-full sm:w-1/2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-500">Subtotal</span>
                            <span className="text-sm font-medium text-slate-900">₹{payment.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-500">Tax (0%)</span>
                            <span className="text-sm font-medium text-slate-900">₹0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900">Total Due</span>
                            <span className="text-2xl font-bold text-slate-900">₹{payment.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 print:mt-8">
                    <p className="text-xs text-center text-slate-400">
                        Payment is required within 7 days of invoice date. Thank you for your business.
                    </p>
                </div>
            </div>
        </div>
    );
}
