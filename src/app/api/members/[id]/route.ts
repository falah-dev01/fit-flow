import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify the user exists
        const user = await prisma.user.findUnique({
            where: { id },
            include: { memberships: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // SQLite strict foreign keys can sometimes block automatic cascades.
        // We will manually delete related Payments and Memberships in a transaction.
        const membershipIds = user.memberships.map((m) => m.id);

        await prisma.$transaction([
            // 1. Delete all payments connected to these memberships
            prisma.payment.deleteMany({
                where: { membershipId: { in: membershipIds } }
            }),
            // 2. Delete the memberships
            prisma.membership.deleteMany({
                where: { userId: id }
            }),
            // 3. Delete the user
            prisma.user.delete({
                where: { id }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: 'Failed to delete member' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, phone_number: true, role: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
                phone_number: body.phone_number
            },
            include: { memberships: true }
        });

        // If planId was sent and differs from current
        const primaryMembership = updatedUser.memberships?.[0];
        const currentPlanId = primaryMembership?.planId || '';

        if (body.planId !== undefined && body.planId !== currentPlanId) {
            if (body.planId === '') {
                // Removing plan (only if membership exists)
                if (primaryMembership) {
                    await prisma.membership.update({
                        where: { id: primaryMembership.id },
                        data: { planId: null, status: 'PENDING' }
                    });
                }
            } else {
                // Assigning or changing to a new plan
                const plan = await prisma.subscriptionPlan.findUnique({ where: { id: body.planId } });
                if (plan) {
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 1);

                    if (primaryMembership) {
                        // Update existing
                        await prisma.membership.update({
                            where: { id: primaryMembership.id },
                            data: {
                                planId: plan.id,
                                status: 'ACTIVE',
                                feeAmount: plan.entryFee + plan.monthlyFee,
                                startDate,
                                endDate
                            }
                        });
                    } else {
                        // Create new membership for this user
                        await prisma.membership.create({
                            data: {
                                userId: id,
                                planId: plan.id,
                                status: 'ACTIVE',
                                feeAmount: plan.entryFee + plan.monthlyFee,
                                startDate,
                                endDate
                            }
                        });
                    }
                }
            }
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}
