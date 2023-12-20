<script lang="ts">
    import {
        AvatarInitials,
        EmptySearch,
        Heading,
        PaginationWithLimit,
        Trim
    } from '$lib/components';
    import {
        TableBody,
        TableHeader,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText,
        TableScroll
    } from '$lib/elements/table';
    import { Container, ContainerHeader } from '$lib/layout';
    import { hoursToDays, toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { tierToPlan, type PlanServices } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';

    export let logs: Models.LogList;
    export let offset = 0;
    export let limit = 0;

    export let service: PlanServices = null;
</script>

<Container>
    {#if service}
        <ContainerHeader title="Activity" />
    {:else}
        <Heading tag="h2" size="5">Activity</Heading>
    {/if}
    {#if logs.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={100}>User</TableCellHead>
                <TableCellHead width={100}>Event</TableCellHead>
                <TableCellHead width={80}>Location</TableCellHead>
                <TableCellHead width={90}>IP</TableCellHead>
                <TableCellHead width={140}>Date</TableCellHead>
            </TableHeader>
            <TableBody service="logs" total={isCloud ? Infinity : 0}>
                <svelte:fragment slot="limit" let:limit let:upgradeMethod>
                    <p class="text">
                        Logs are retained in rolling {hoursToDays(limit)} intervals with the
                        {tierToPlan($organization.billingPlan).name}
                        plan.
                        {#if $organization?.billingPlan === 'tier-0'}
                            <Button link on:click={upgradeMethod}>Upgrade</Button> to increase your log
                            retention for a longer period.
                        {/if}
                    </p>
                </svelte:fragment>
                {#each logs.logs as log}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-cross-center u-gap-12">
                                {#if log.userEmail}
                                    {#if log.userName}
                                        <AvatarInitials size={32} name={log.userName} />
                                        <Trim>{log.userName}</Trim>
                                    {:else}
                                        <AvatarInitials size={32} name={log.userEmail} />
                                        <Trim>{log.userEmail}</Trim>
                                    {/if}
                                {:else}
                                    <div class="avatar is-size-small">
                                        <span class="icon-anonymous" aria-hidden="true" />
                                    </div>
                                    <span class="text u-trim">{log.userName ?? 'Anonymous'}</span>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Event">{log.event}</TableCellText>

                        <TableCellText title="Location">
                            {#if log.countryCode !== '--'}
                                {log.countryName}
                            {:else}
                                Unknown
                            {/if}
                        </TableCellText>
                        <TableCellText title="IP">{log.ip}</TableCellText>
                        <TableCellText title="Date">{toLocaleDateTime(log.time)}</TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>

        <PaginationWithLimit name="Logs" {limit} {offset} total={logs.total} />
    {:else}
        <EmptySearch>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="u-text-center">
                    <p class="text u-line-height-1-5">
                        You have no activity. Once your users start interacting with your app you'll
                        see their activity here.
                    </p>
                </div>
            </div>
        </EmptySearch>
    {/if}
</Container>
