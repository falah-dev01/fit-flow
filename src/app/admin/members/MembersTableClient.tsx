'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, CheckCircle2, XCircle, Users } from 'lucide-react';
import { EditMemberButton, DeleteMemberButton, RenewMemberButton, CustomFeeButton } from '@/components/ActionButtons';

export default function MembersTableClient({ initialMembers }: { initialMembers: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Members');

    const tabs = ['All Members', 'Active', 'Pending', 'Inactive'];

    // Filter logic
    const filteredMembers = initialMembers.filter(member => {
        // 1. Search Query
        const matchesSearch =
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.phone_number?.includes(searchQuery) ||
            member.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // 2. Tab Filter
        const primaryMembership = member.memberships?.[0];
        const status = primaryMembership?.status || 'INACTIVE'; // e.g., 'ACTIVE', 'PENDING'

        if (activeTab === 'All Members') return true;

        // Map UI tabs to DB status
        if (activeTab === 'Active') return status === 'ACTIVE';
        if (activeTab === 'Pending') return status === 'PENDING';
        if (activeTab === 'Inactive') return status !== 'ACTIVE' && status !== 'PENDING';

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Members</h2>
                    <p className="text-slate-600 text-sm mt-1">Manage your gym's member directory and subscriptions.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
                        />
                    </div>
                    <Link href="/admin/members/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition">
                        <UserPlus className="w-4 h-4" /> Add Member
                    </Link>
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
                        {tab} {tab === 'All Members' && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{initialMembers.length}</span>}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Details</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expires</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredMembers.map((member: any) => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{member.name || 'Unnamed'}</div>
                                                <div className="text-sm text-slate-500">ID: {member.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-slate-500">{member.phone_number || 'N/A'}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {member.memberships?.[0]?.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                            </span>
                                        ) : member.memberships?.[0]?.status === 'PENDING' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                <Users className="w-3.5 h-3.5" /> Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/20">
                                                <XCircle className="w-3.5 h-3.5" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        {member.memberships?.[0]?.endDate ? (
                                            <span className={`${new Date(member.memberships[0].endDate) < new Date() ? 'text-red-600' : 'text-slate-900'}`}>
                                                {new Date(member.memberships[0].endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <CustomFeeButton memberId={member.memberships?.[0]?.id || member.id} />
                                            <RenewMemberButton id={member.id} />
                                            <EditMemberButton id={member.id} />
                                            <DeleteMemberButton id={member.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Users className="mx-auto h-12 w-12 text-slate-300" />
                                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No members found</h3>
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
