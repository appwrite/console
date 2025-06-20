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
    import { columns, type Attributes, isCsvImportInProgress } from '../store';
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
    let selectedAttribute: Attributes = null;
    let showCreate = false;
    let showDelete = false;
    let showEdit = false;
    let showCreateIndex = false;
    let showFailed = false;
    let error = '';

    const attributeFormatIcon = {
        ip: IconLocationMarker,
        url: IconLink,
        email: IconLink,
        enum: IconViewList
    };

    function getAttributeStatusBadge(status: string): ComponentProps<Badge>['type'] {
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
            {#each $columns as attribute, index}
                {@const option = columnOptions.find((option) => option.type === attribute.type)}
                <Table.Row.Base {root}>
                    <Table.Cell column="key" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            {#if isRelationship(attribute)}
                                <Icon
                                    size="s"
                                    icon={attribute?.twoWay
                                        ? IconSwitchHorizontal
                                        : IconArrowSmRight} />
                            {:else if 'format' in attribute && attribute.format}
                                {@const icon = attributeFormatIcon[attribute?.format]}
                                <Icon {icon} size="s" />
                            {:else}
                                <Icon icon={option.icon} size="s" />
                            {/if}
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Layout.Stack inline direction="row" alignItems="center" gap="xxs">
                                    <span class="text u-trim-1" data-private>{attribute.key}</span>
                                    {#if isString(attribute) && attribute.encrypt}
                                        <Tooltip>
                                            <Icon
                                                size="s"
                                                icon={IconLockClosed}
                                                color="--fgcolor-neutral-tertiary" />
                                            <div slot="tooltip">Encrypted</div>
                                        </Tooltip>
                                    {/if}
                                </Layout.Stack>
                                {#if attribute.status !== 'available'}
                                    <Badge
                                        size="s"
                                        variant="secondary"
                                        content={attribute.status}
                                        type={getAttributeStatusBadge(attribute.status)} />
                                    {#if attribute.error}
                                        <Link.Button
                                            variant="muted"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                error = attribute.error;
                                                showFailed = true;
                                            }}>Details</Link.Button>
                                    {/if}
                                {:else if attribute.required}
                                    <Badge size="xs" variant="secondary" content="required" />
                                {/if}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="type" {root}>
                        {#if 'format' in attribute && attribute.format}
                            <span class="u-capitalize">{attribute.format}</span>
                        {:else}
                            <p>
                                <span class="u-capitalize">{attribute.type}</span>
                                {#if isRelationship(attribute)}
                                    <span>
                                        with <a
                                            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${attribute?.relatedCollection}`}
                                            ><b data-private>{attribute?.key}</b></a>
                                    </span>
                                {/if}
                            </p>
                        {/if}
                        <span>
                            {attribute.array ? '[]' : ''}
                        </span>
                    </Table.Cell>
                    <Table.Cell column="default" {root}>
                        {attribute?.default !== null && attribute?.default !== undefined
                            ? attribute?.default
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
                                            selectedAttribute = attribute;
                                            showDropdown[index] = false;
                                        }}>
                                        Update
                                    </ActionMenu.Item.Button>
                                    {#if !isRelationship(attribute)}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPlus}
                                            on:click={(event) => {
                                                toggle(event);
                                                selectedAttribute = attribute;
                                                showCreateIndex = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Create index
                                        </ActionMenu.Item.Button>
                                    {/if}
                                    {#if attribute.status !== 'processing'}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconTrash}
                                            on:click={(event) => {
                                                toggle(event);
                                                showDelete = true;
                                                showDropdown[index] = false;
                                                selectedAttribute = attribute;
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
                    href="https://appwrite.io/docs/products/databases/collections#attributes"
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
    <Delete bind:showDelete {selectedAttribute} />
{/if}
{#if showEdit}
    <Edit bind:showEdit {selectedAttribute} />
{/if}
{#if showCreateIndex}
    <CreateIndex bind:showCreateIndex externalAttribute={selectedAttribute} />
{/if}
{#if showFailed}
    <FailedModal bind:show={showFailed} title="Create column" header="Creation failed" {error} />
{/if}
