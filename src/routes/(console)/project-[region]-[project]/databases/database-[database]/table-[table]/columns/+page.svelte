<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { canWriteCollections } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Link,
        Popover,
        Table,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Create from '../createColumn.svelte';
    import { isRelationship, isString } from '../row-[row]/columns/store';
    import FailedModal from '../failedModal.svelte';
    import CreateIndex from '../indexes/createIndex.svelte';
    import { columns, type Columns, isCsvImportInProgress } from '../store';
    import CreateColumnDropdown from './createColumnDropdown.svelte';
    import Delete from './deleteColumn.svelte';
    import Edit from './edit.svelte';
    import { columnOptions, type Option } from './store';
    import {
        IconArrowSmRight,
        IconDotsHorizontal,
        IconLink,
        IconLocationMarker,
        IconPencil,
        IconPlus,
        IconSwitchHorizontal,
        IconTrash,
        IconViewList,
        IconLockClosed
    } from '@appwrite.io/pink-icons-svelte';
    import type { ComponentProps } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import CsvDisabled from '../csvDisabled.svelte';

    const databaseId = page.params.database;

    let showDropdown = [];
    let selectedOption: Option['name'] = null;
    let selectedColumn: Columns = null;
    let showCreate = false;
    let showDelete = false;
    let showEdit = false;
    let showCreateIndex = false;
    let showFailed = false;
    let error = '';

    const columnFormatIcon = {
        ip: IconLocationMarker,
        url: IconLink,
        email: IconLink,
        enum: IconViewList
    };

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
        <Typography.Title>Columns</Typography.Title>
        {#if $canWriteCollections}
            <CreateColumnDropdown bind:selectedOption bind:showCreate />
        {/if}
    </Layout.Stack>

    {#if $columns.length}
        <Table.Root
            let:root
            columns={[
                { id: 'key' },
                { id: 'type' },
                { id: 'default' },
                { id: 'actions', width: 40 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="key" {root}>Key</Table.Header.Cell>
                <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                <Table.Header.Cell column="default" {root}>Default value</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each $columns as column, index}
                {@const option = columnOptions.find((option) => option.type === column.type)}
                <Table.Row.Base {root}>
                    <Table.Cell column="key" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            {#if isRelationship(column)}
                                <Icon
                                    size="s"
                                    icon={column?.twoWay
                                        ? IconSwitchHorizontal
                                        : IconArrowSmRight} />
                            {:else if 'format' in column && column.format}
                                {@const icon = columnFormatIcon[column?.format]}
                                <Icon {icon} size="s" />
                            {:else}
                                <Icon icon={option.icon} size="s" />
                            {/if}
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Layout.Stack inline direction="row" alignItems="center" gap="xxs">
                                    <span class="text u-trim-1" data-private>{column.key}</span>
                                    {#if isString(column) && column.encrypt}
                                        <Tooltip>
                                            <Icon
                                                size="s"
                                                icon={IconLockClosed}
                                                color="--fgcolor-neutral-tertiary" />
                                            <div slot="tooltip">Encrypted</div>
                                        </Tooltip>
                                    {/if}
                                </Layout.Stack>
                                {#if column.status !== 'available'}
                                    <Badge
                                        size="s"
                                        variant="secondary"
                                        content={column.status}
                                        type={getColumnStatusBadge(column.status)} />
                                    {#if column.error}
                                        <Link.Button
                                            variant="muted"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                error = column.error;
                                                showFailed = true;
                                            }}>Details</Link.Button>
                                    {/if}
                                {:else if column.required}
                                    <Badge size="xs" variant="secondary" content="required" />
                                {/if}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="type" {root}>
                        {#if 'format' in column && column.format}
                            <span class="u-capitalize">{column.format}</span>
                        {:else}
                            <p>
                                <span class="u-capitalize">{column.type}</span>
                                {#if isRelationship(column)}
                                    <span>
                                        with <a
                                            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${column?.relatedTable}`}
                                            ><b data-private>{column?.key}</b></a>
                                    </span>
                                {/if}
                            </p>
                        {/if}
                        <span>
                            {column.array ? '[]' : ''}
                        </span>
                    </Table.Cell>
                    <Table.Cell column="default" {root}>
                        {column?.default !== null && column?.default !== undefined
                            ? column?.default
                            : '-'}
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        {#if $isCsvImportInProgress}
                            <CsvDisabled>
                                <Button disabled text icon ariaLabel="more options">
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                            </CsvDisabled>
                        {:else}
                            <Popover let:toggle padding="none" placement="bottom-end">
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip" let:toggle>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconPencil}
                                        on:click={(event) => {
                                            toggle(event);
                                            showEdit = true;
                                            selectedColumn = column;
                                            showDropdown[index] = false;
                                        }}>
                                        Update
                                    </ActionMenu.Item.Button>
                                    {#if !isRelationship(column)}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPlus}
                                            on:click={(event) => {
                                                toggle(event);
                                                selectedColumn = column;
                                                showCreateIndex = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Create index
                                        </ActionMenu.Item.Button>
                                    {/if}
                                    {#if column.status !== 'processing'}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconTrash}
                                            on:click={(event) => {
                                                toggle(event);
                                                showDelete = true;
                                                showDropdown[index] = false;
                                                selectedColumn = column;
                                                trackEvent(Click.DatabaseColumnDelete);
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    {/if}
                                </ActionMenu.Root>
                            </Popover>
                        {/if}
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {:else}
        <Empty single target="column">
            <svelte:fragment slot="actions">
                <Button
                    external
                    href="https://appwrite.io/docs/products/databases/tables#columns"
                    text
                    event="empty_documentation"
                    ariaLabel={'create column'}>Documentation</Button>
                {#if $canWriteCollections}
                    <CreateColumnDropdown bind:selectedOption bind:showCreate let:toggle>
                        <Button secondary event="create_column" on:click={toggle}>
                            Create column
                        </Button>
                    </CreateColumnDropdown>
                {/if}
            </svelte:fragment>
        </Empty>
    {/if}
</Container>

{#if showCreate}
    <Create bind:showCreate bind:selectedOption />
{/if}
{#if showDelete}
    <Delete bind:showDelete {selectedColumn} />
{/if}
{#if showEdit}
    <Edit bind:showEdit {selectedColumn} />
{/if}
{#if showCreateIndex}
    <CreateIndex bind:showCreateIndex externalColumn={selectedColumn} />
{/if}
{#if showFailed}
    <FailedModal bind:show={showFailed} title="Create column" header="Creation failed" {error} />
{/if}
