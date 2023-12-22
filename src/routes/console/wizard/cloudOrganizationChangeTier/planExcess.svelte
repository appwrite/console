<script lang="ts">
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Alert } from '$lib/components';
    import { plansInfo, type Tier } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { abbreviateNumber } from '$lib/helpers/numbers';
    import { formatNum } from '$lib/helpers/string';

    export let excess: {
        bandwidth?: number;
        storage?: number;
        users?: number;
        executions?: number;
        members?: number;
    } = null;
    export let currentTier: Tier;

    const plan = $plansInfo?.get(currentTier);
    const collaboratorPrice = plan?.addons.member?.price ?? 0;
</script>

<Alert type="error">
    <svelte:fragment slot="title">
        {#if currentTier === 'tier-0'}
            Your usage exceeds the {plan.name} plan limits
        {:else}
            Changing your plan now will result in removal of organization members and more
        {/if}
    </svelte:fragment>

    {#if excess?.members > 0}
        {#if currentTier === 'tier-0'}
            The Starter plan has a limit of one organization member. By proceeding, all but the
            creator of the organization admin will be removed.
        {:else if currentTier === 'tier-1'}
            Additional organization members on the Pro plan cost {collaboratorPrice} per member per billing
            period. By proceeding, you acknowledge your fees may increase in your next billing period.
        {/if}
    {/if}
    {#if excess?.bandwidth > 0 || excess?.executions > 0 || excess?.storage > 0 || excess?.users}
        Until you reduce your usage, you will be unable to add to the resources listed below in all
        projects within your organization. The current billing cycle will end on {toLocaleDate(
            $organization.billingCurrentInvoiceDate
        )}. Any executions, bandwidth, or messaging usage will be reset at that time.
    {/if}

    <svelte:fragment slot="buttons">
        {#if currentTier === 'tier-0'}
            <Button
                text
                external
                href="https://appwrite.io/docs/advanced/platform/starter#reaching-resource-limits">
                Learn more
            </Button>
        {:else if currentTier === 'tier-1'}
            <Button
                text
                external
                href="https://appwrite.io/docs/advanced/platform/pro#reaching-resource-limits">
                Learn more
            </Button>
        {/if}
    </svelte:fragment>
</Alert>

<TableScroll noMargin>
    <TableHeader>
        <TableCellHead>Resource</TableCellHead>
        <TableCellHead>Free limit</TableCellHead>
        <TableCellHead>Excess usage</TableCellHead>
    </TableHeader>
    <TableBody>
        {#if excess?.members}
            <TableRow>
                <TableCellText title="members">Organization members</TableCellText>
                <TableCellText title="limit">{plan.members} members</TableCellText>
                <TableCell title="excess">
                    <p class="u-color-text-danger u-flex u-cross-center u-gap-4">
                        <span class="icon-arrow-up" />
                        {excess?.members} members
                    </p>
                </TableCell>
            </TableRow>
        {/if}
        {#if excess?.storage}
            <TableRow>
                <TableCellText title="storage">Storage</TableCellText>
                <TableCellText title="limit">{plan.storage} GB</TableCellText>
                <TableCell title="excess">
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        {humanFileSize(excess?.storage)}
                    </p>
                </TableCell>
            </TableRow>
        {/if}
        {#if excess?.executions}
            <TableRow>
                <TableCellText title="executions">Function executions</TableCellText>
                <TableCellText title="limit">
                    {abbreviateNumber(plan.executions)} executions
                </TableCellText>
                <TableCell title="excess">
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        <span
                            title={excess?.executions
                                ? excess.executions.toString()
                                : 'executions'}>
                            {formatNum(excess?.executions)} executions
                        </span>
                    </p>
                </TableCell>
            </TableRow>
        {/if}
        {#if excess?.users}
            <TableRow>
                <TableCellText title="users">Users</TableCellText>
                <TableCellText title="limit">
                    {abbreviateNumber(plan.users)} users
                </TableCellText>
                <TableCell title="excess">
                    <p class="u-color-text-danger">
                        <span class="icon-arrow-up" />
                        <span title={excess?.users ? excess.users.toString() : 'users'}>
                            {formatNum(excess?.users)} users
                        </span>
                    </p>
                </TableCell>
            </TableRow>
        {/if}
    </TableBody>
</TableScroll>
