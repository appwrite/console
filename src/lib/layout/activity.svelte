<script lang="ts">
    import {
        AvatarInitials,
        EmptySearch,
        Heading,
        PaginationWithLimit,
        Trim
    } from '$lib/components';
    import { Container, ContainerHeader } from '$lib/layout';
    import { hoursToDays, toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { tierToPlan, type PlanServices } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { BillingPlan } from '$lib/constants';
    import { Layout, Table } from '@appwrite.io/pink-svelte';

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
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>User</Table.Header.Cell>
                <Table.Header.Cell>Event</Table.Header.Cell>
                <Table.Header.Cell>Location</Table.Header.Cell>
                <Table.Header.Cell>IP</Table.Header.Cell>
                <Table.Header.Cell>Date</Table.Header.Cell>
            </svelte:fragment>
            {#each logs.logs as log}
                <Table.Row>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center">
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
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>
                        {log.event}
                    </Table.Cell>
                    <Table.Cell>
                        {#if log.countryCode !== '--'}
                            {log.countryName}
                        {:else}
                            Unknown
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        {log.ip}
                    </Table.Cell>
                    <Table.Cell>
                        {toLocaleDateTime(log.time)}
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Root>

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
