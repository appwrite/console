<script lang="ts">
    import { AvatarInitials, PaginationWithLimit, Trim } from '$lib/components';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Table, Card, Empty, InteractiveText } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import type { PinkColumn } from '$lib/helpers/types';

    export let limit = 0;
    export let offset = 0;
    export let logs: Models.LogList;
    export let insideSideSheet = false;
    export let databasesScreen = false;
    export let useCreateLinkForPagination = true;

    function getColumnWidth(columnId: string): Pick<PinkColumn, 'width'> {
        const widthConfig: Record<
            string,
            { insideSheet: number | { min: number }; default: number | { min: number } }
        > = {
            user: { insideSheet: 140, default: { min: 100 } },
            event: { insideSheet: 125, default: { min: 160 } },
            location: { insideSheet: 100, default: { min: 120 } },
            ip: { insideSheet: { min: 150 }, default: { min: 250 } },
            date: { insideSheet: { min: 200 }, default: { min: 180 } }
        };

        const config = widthConfig[columnId];
        if (!config) {
            return {};
        }

        return { width: insideSideSheet ? config.insideSheet : config.default };
    }

    const columns: PinkColumn[] = [
        { id: 'user', ...getColumnWidth('user') },
        { id: 'event', ...getColumnWidth('event') },
        { id: 'location', ...getColumnWidth('location') },
        { id: 'ip', ...getColumnWidth('ip') },
        { id: 'date', ...getColumnWidth('date') }
    ];
</script>

<Container
    {databasesScreen}
    {insideSideSheet}
    expanded={databasesScreen && !insideSideSheet}
    slotSpacing={databasesScreen && !insideSideSheet}>
    {#if logs.total}
        <Table.Root {columns} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="user" {root}>User</Table.Header.Cell>
                <Table.Header.Cell column="event" {root}>Event</Table.Header.Cell>
                <Table.Header.Cell column="location" {root}>Location</Table.Header.Cell>
                <Table.Header.Cell column="ip" {root}>IP</Table.Header.Cell>
                <Table.Header.Cell column="date" {root}>Date</Table.Header.Cell>
            </svelte:fragment>
            {#each logs.logs as log}
                <Table.Row.Base {root}>
                    <Table.Cell column="user" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            {#if log.userEmail}
                                {#if log.userName}
                                    <AvatarInitials size="xs" name={log.userName} />
                                    <Trim>{log.userName}</Trim>
                                {:else}
                                    <AvatarInitials size="xs" name={log.userEmail} />
                                    <Trim>{log.userEmail}</Trim>
                                {/if}
                            {:else}
                                <div class="avatar is-size-small">
                                    <span class="icon-anonymous" aria-hidden="true"></span>
                                </div>
                                <span class="text u-trim">{log.userName ?? 'Anonymous'}</span>
                            {/if}
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="event" {root}>
                        {log.event}
                    </Table.Cell>
                    <Table.Cell column="location" {root}>
                        {#if log.countryCode !== '--'}
                            {log.countryName}
                        {:else}
                            Unknown
                        {/if}
                    </Table.Cell>
                    <Table.Cell column="ip" {root}>
                        <InteractiveText variant="copy" text={log.ip} isVisible />
                    </Table.Cell>
                    <Table.Cell column="date" {root}>
                        {toLocaleDateTime(log.time)}
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            {limit}
            {offset}
            on:page
            name="Logs"
            total={logs.total}
            useCreateLink={useCreateLinkForPagination} />
    {:else}
        <Card.Base padding="none">
            <Empty
                title="No activities available"
                description="Need a hand? Learn more in our documentation."
                type="secondary">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/products/databases/databases">
                        Documentation
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
