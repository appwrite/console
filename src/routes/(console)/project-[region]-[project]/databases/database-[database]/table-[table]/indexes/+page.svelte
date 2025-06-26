<script lang="ts">
    import { Empty } from '$lib/components';
    import { Container } from '$lib/layout';
    import { table } from '../store';
    import Delete from './deleteIndex.svelte';
    import Create from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import CreateColumn from '../createColumn.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import CreateColumnDropdown from '../columns/createColumnDropdown.svelte';
    import type { Option } from '../columns/store';
    import FailedModal from '../failedModal.svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Link,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconEye,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import type { ComponentProps } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let data;

    let error = '';
    let showFailed = false;
    let showDelete = false;
    let showOverview = false;
    let showCreateIndex = false;
    let showCreateColumn = false;
    let selectedColumn: Option['name'] = null;
    let selectedIndex: Models.ColumnIndex = null;

    function getColumnStatusBadge(status: string): ComponentProps<Badge>['type'] {
        switch (status) {
            case 'processing':
                return 'warning';
            case 'deleting':
            case 'stuck':
            case 'failed':
                return 'error';
            default:
                return undefined;
        }
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Typography.Title>Indexes</Typography.Title>
        {#if $canWriteTables}
            <Button
                event="create_index"
                disabled={!$table?.columns?.length}
                on:click={() => (showCreateIndex = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create index
            </Button>
        {/if}
    </Layout.Stack>

    {#if data.table?.columns?.length}
        {#if data.table.indexes.length}
            <Table.Root
                let:root
                columns={[
                    { id: 'key' },
                    { id: 'type' },
                    { id: 'columns' },
                    { id: 'orders' },
                    { id: 'lengths' },
                    { id: 'actions', width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="key" {root}>Key</Table.Header.Cell>
                    <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                    <Table.Header.Cell column="columns" {root}>Columns</Table.Header.Cell>
                    <Table.Header.Cell column="orders" {root}>Orders</Table.Header.Cell>
                    <Table.Header.Cell column="lengths" {root}>Lengths</Table.Header.Cell>
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each data.table.indexes as index}
                    <Table.Row.Base {root}>
                        <Table.Cell column="key" {root}>
                            <Layout.Stack direction="row" alignItems="center">
                                {index.key}
                                {#if index.status !== 'available'}
                                    <Badge
                                        size="s"
                                        variant="secondary"
                                        content={index.status}
                                        type={getColumnStatusBadge(index.status)} />
                                    {#if index.error}
                                        <Link.Button
                                            variant="muted"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                error = index.error;
                                                showFailed = true;
                                            }}>Details</Link.Button>
                                    {/if}
                                {/if}
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell column="type" {root}>{index.type}</Table.Cell>
                        <Table.Cell column="columns" {root}>
                            {index.columns}
                        </Table.Cell>
                        <Table.Cell column="orders" {root}>
                            {index.orders}
                        </Table.Cell>
                        <Table.Cell column="lengths" {root}>
                            {index.lengths}
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Popover let:toggle padding="none" placement="bottom-end">
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconEye}
                                        on:click={() => {
                                            selectedIndex = index;
                                            showOverview = true;
                                        }}>Overview</ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTrash}
                                        on:click={() => {
                                            selectedIndex = index;
                                            showDelete = true;
                                            trackEvent(Click.DatabaseIndexDelete);
                                        }}>Delete</ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        {:else}
            <Empty
                allowCreate={$canWriteTables}
                single
                href="https://appwrite.io/docs/products/databases/tables#indexes"
                target="index"
                on:click={() => (showCreateIndex = true)} />
        {/if}
    {:else}
        <Empty single target="index">
            <svelte:fragment slot="actions">
                <Button
                    external
                    href="https://appwrite.io/docs/products/databases/tables#columns"
                    text
                    event="empty_documentation"
                    ariaLabel="create index">Documentation</Button>
                {#if $canWriteTables}
                    <CreateColumnDropdown
                        bind:selectedOption={selectedColumn}
                        bind:showCreate={showCreateColumn}
                        let:toggle>
                        <Button secondary event="create_column" on:click={toggle}>
                            Create column
                        </Button>
                    </CreateColumnDropdown>
                {/if}
            </svelte:fragment>
        </Empty>
    {/if}
</Container>

<Create bind:showCreateIndex />

{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} />
    <Overview bind:showOverview {selectedIndex} />
{/if}

{#if showCreateColumn}
    <CreateColumn bind:showCreate={showCreateColumn} bind:selectedOption={selectedColumn} />
{/if}

<FailedModal bind:show={showFailed} title="Create index" header="Creation failed" {error} />
