<script lang="ts">
    import { Alert } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        TableScroll,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';

    import { WizardStep } from '$lib/layout';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { changeOrganizationTier } from './store';

    $: console.log($organization);
    $: console.log($plansInfo);

    const plan = $plansInfo.plans.find((p) => p.$id === $changeOrganizationTier.billingPlan);
    const collaboratorPrice = plan?.addons.member?.price ?? 0;
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >Your usage exceeds the limits of the {tierToPlan($organization.billingPlan)} plan</svelte:fragment>
    <svelte:fragment slot="subtitle">
        View the current usage for <b>{$organization.name}</b> and where you will exceed the limits of
        your new plan.
    </svelte:fragment>

    <Alert type="error">
        <svelte:fragment slot="title">
            Changing your plan now will result in removal of organization members and more
        </svelte:fragment>

        {#if $changeOrganizationTier?.limitOverflow?.members > 0}
            {#if $changeOrganizationTier?.billingPlan === 'tier-0'}
                The Starter plan has a limit of one organization member. By proceeding, all but the
                creator of the organization admin will be removed.
            {:else if $changeOrganizationTier?.billingPlan === 'tier-1'}
                Additional organization members on the Pro plan cost {collaboratorPrice} per member per
                billing period. By proceeding, you acknowledge your fees may increase in your next billing
                period.
            {/if}
        {/if}
        {#if $changeOrganizationTier?.limitOverflow?.bandwidth > 0 || $changeOrganizationTier?.limitOverflow?.executions > 0 || $changeOrganizationTier?.limitOverflow?.storage > 0 || $changeOrganizationTier?.limitOverflow?.users}
            The Starter plan has a limit of one organization member. By proceeding, all but the
            creator of the organization admin will be removed. Until you reduce your usage, you will
            be unable to add to the resources listed below in all projects within your organization.
            Your current billing cycle will end on {toLocaleDate(
                $organization.billingCurrentInvoiceDate
            )}. Any executions, bandwidth, or messaging usage will be reset at that time.
        {/if}

        <svelte:fragment slot="buttons">
            <Button text>Learn more</Button>
        </svelte:fragment>
    </Alert>

    <TableScroll>
        <TableHeader>
            <TableCellHead>Resource</TableCellHead>
            <TableCellHead>Free limit</TableCellHead>
            <TableCellHead>Excess usage</TableCellHead>
        </TableHeader>
        <TableBody>
            {#if $changeOrganizationTier?.limitOverflow?.members}
                <TableRow>
                    <TableCellText title="members">Organization members</TableCellText>
                    <TableCellText title="limit">{plan.members} members</TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger u-flex u-cross-center u-gap-4">
                            <span class="icon-arrow-up" />
                            {$changeOrganizationTier.limitOverflow.members} members
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if $changeOrganizationTier?.limitOverflow?.storage}
                <TableRow>
                    <TableCellText title="storage">Storage</TableCellText>
                    <TableCellText title="limit">{plan.storage} GB</TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            {humanFileSize($changeOrganizationTier.limitOverflow.storage)}
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if $changeOrganizationTier?.limitOverflow?.executions}
                <TableRow>
                    <TableCellText title="executions">Function executions</TableCellText>
                    <TableCellText title="limit">
                        {abbreviateNumber(plan.executions)} executions
                    </TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            {$changeOrganizationTier.limitOverflow.executions} executions
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
            {#if $changeOrganizationTier?.limitOverflow?.users}
                <TableRow>
                    <TableCellText title="users">Users</TableCellText>
                    <TableCellText title="limit">
                        {abbreviateNumber(plan.users)} users
                    </TableCellText>
                    <TableCell title="excess">
                        <p class="u-color-text-danger">
                            <span class="icon-arrow-up" />
                            {$changeOrganizationTier.limitOverflow.users} users
                        </p>
                    </TableCell>
                </TableRow>
            {/if}
        </TableBody>
    </TableScroll>
</WizardStep>
