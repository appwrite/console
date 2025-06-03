<script lang="ts">
    import { AvatarInitials, CardGrid, Paginator } from '$lib/components';
    import { EmptyCardCloud } from '$lib/components/billing';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { newMemberModal, organization } from '$lib/stores/organization';
    import type { Models } from '@appwrite.io/console';
    import { IconInfo, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Table, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let members: Models.MembershipList;

    $: total = members?.total ?? 0;
    $: plan = $plansInfo?.get($organization?.billingPlan);
</script>

<CardGrid>
    <svelte:fragment slot="title">Members</svelte:fragment>
    The number of members in your organization.
    <svelte:fragment slot="aside">
        {#if $organization.billingPlan !== BillingPlan.FREE}
            <div class="u-flex u-flex-vertical">
                <Layout.Stack direction="row" justifyContent="space-between">
                    <Layout.Stack gap="s" direction="row" alignItems="center">
                        <Typography.Title>
                            {total}
                        </Typography.Title>
                        <Typography.Text>Members</Typography.Text>
                        <Typography.Text color="--fgcolor-neutral-tertiary">/</Typography.Text>
                        <Layout.Stack gap="xxxs" direction="row" alignItems="center">
                            <Typography.Text color="--fgcolor-neutral-tertiary">
                                unlimited
                            </Typography.Text>
                            <Tooltip maxWidth="200px">
                                <Icon icon={IconInfo} size="s" />
                                <svelte:fragment slot="tooltip">
                                    You can add unlimited organization members on the {tierToPlan(
                                        $organization.billingPlan
                                    ).name} plan {$organization.billingPlan === BillingPlan.PRO
                                        ? `for ${formatCurrency(plan.addons.seats.price)} each per billing period.`
                                        : '.'}
                                </svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                    </Layout.Stack>
                    <Button secondary on:click={() => newMemberModal.set(true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Invite
                    </Button>
                </Layout.Stack>
            </div>
            <Paginator items={members.memberships} hideFooter={members?.total <= 5}>
                {#snippet children(paginatedItems: typeof members.memberships)}
                    <Table.Root columns={2} let:root>
                        <svelte:fragment slot="header" let:root>
                            <Table.Header.Cell {root}>Members</Table.Header.Cell>
                            <Table.Header.Cell {root}>Joined</Table.Header.Cell>
                        </svelte:fragment>
                        {#each paginatedItems as member}
                            <Table.Row.Base {root}>
                                <Table.Cell {root}>
                                    <Layout.Stack direction="row" alignItems="center" gap="s">
                                        <AvatarInitials
                                            size="xs"
                                            name={member.userName
                                                ? member.userName
                                                : member.userEmail} />
                                        <Layout.Stack gap="none">
                                            <Typography.Text>
                                                {member.userName
                                                    ? member.userName
                                                    : member.userEmail}
                                            </Typography.Text>
                                        </Layout.Stack>
                                    </Layout.Stack>
                                </Table.Cell>
                                <Table.Cell {root}>
                                    <DualTimeView time={member.joined ?? member.$createdAt} />
                                </Table.Cell>
                            </Table.Row.Base>
                        {/each}
                    </Table.Root>
                {/snippet}
            </Paginator>
        {:else}
            <EmptyCardCloud service="members" eventSource="organization_usage" />
        {/if}
    </svelte:fragment>
</CardGrid>
