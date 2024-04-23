<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { AvatarInitials, CardGrid, Heading, Paginator } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { newMemberModal, organization } from '$lib/stores/organization';
    import type { Models } from '@appwrite.io/console';

    export let members: Models.MembershipList;

    $: total = members?.total ?? 0;
    $: plan = $plansInfo?.get($organization?.billingPlan);
</script>

<CardGrid>
    <Heading tag="h6" size="7">Members</Heading>

    <p class="text">The number of members in your organization.</p>
    <svelte:fragment slot="aside">
        {#if $organization.billingPlan !== BillingPlan.STARTER}
            <div class="u-flex u-flex-vertical">
                <div class="u-flex u-main-space-between">
                    <p>
                        <span class="heading-level-4">{total}</span>
                        <span class="body-text-1 u-bold">Members</span>
                    </p>
                    <Button secondary on:click={() => newMemberModal.set(true)}>
                        <span class="icon-plus"></span> <span class="text">Invite</span>
                    </Button>
                </div>
                <p class="body-text-2">
                    Unlimited
                    <span
                        class="icon-info"
                        use:tooltip={{
                            content: `You can add unlimited organization members on the ${tierToPlan($organization.billingPlan).name} plan for ${formatCurrency(plan.addons.member.price)} each per billing period.`
                        }}></span>
                </p>
            </div>
            <Paginator items={members.memberships} let:paginatedItems>
                <TableScroll noMargin noStyles>
                    <TableHeader>
                        <TableCellHead>Members</TableCellHead>
                        <TableCellHead>Joined</TableCellHead>
                    </TableHeader>
                    <TableBody>
                        {#each paginatedItems as member}
                            <TableRow>
                                <TableCell title="name">
                                    <div class="u-flex u-gap-12 u-cross-center">
                                        <AvatarInitials size={32} name={member.userName} />
                                        <span class="text u-trim">
                                            {member.userName ? member.userName : 'n/a'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCellText title="joined">
                                    {member.joined ? toLocaleDate(member.joined) : 'Never'}
                                </TableCellText>
                            </TableRow>
                        {/each}
                    </TableBody>
                </TableScroll>
            </Paginator>
        {:else}
            test
        {/if}
    </svelte:fragment>
</CardGrid>
