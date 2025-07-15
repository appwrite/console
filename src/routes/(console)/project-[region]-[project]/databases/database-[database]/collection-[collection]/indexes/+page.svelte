<script lang="ts">
    import { Container } from '$lib/layout';
    import { collection } from '../store';
    import Delete from './deleteIndex.svelte';
    import Create from './createIndex.svelte';
    import Overview from './overviewIndex.svelte';
    import CreateAttribute from '../createAttribute.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    // import CreateAttributeDropdown from '../attributes/createAttributeDropdown.svelte';
    import type { Option } from '../attributes/store';
    import FailedModal from '../failedModal.svelte';
    import { canWriteCollections } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Link,
        Popover,
        Spreadsheet
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconEye,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import type { ComponentProps } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import EmptySheet from '../layout/emptySheet.svelte';
    import SpreadsheetContainer from '../layout/spreadsheet.svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';

    export let data;

    let selectedIndex: Models.Index = null;
    let showCreateIndex = false;
    let showOverview = false;
    let showDelete = false;
    let showCreateAttribute = false;
    let selectedAttribute: Option['name'] = null;
    let showFailed = false;
    let error = '';

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

<Container expanded style="background: var(--bgcolor-neutral-primary)">
    <Layout.Stack direction="row" justifyContent="flex-end">
        {#if $canWriteCollections}
            <Button
                secondary
                event="create_index"
                disabled={!$collection?.attributes?.length}
                on:click={() => (showCreateIndex = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create index
            </Button>
        {/if}
    </Layout.Stack>
</Container>

<div class="databases-spreadsheet">
    {#if data.collection?.attributes?.length}
        {#if data.collection.indexes.length}
            <SpreadsheetContainer>
                <Spreadsheet.Root
                    let:root
                    columns={[
                        { id: 'key' },
                        { id: 'type' },
                        { id: 'attributes' },
                        { id: 'orders' },
                        { id: 'lengths' },
                        { id: 'actions', width: 40 }
                    ]}>
                    <svelte:fragment slot="header" let:root>
                        <Spreadsheet.Header.Cell column="key" {root}>Key</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="type" {root}>Type</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="attributes" {root}
                            >Attributes</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="orders" {root}
                            >Orders</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="lengths" {root}
                            >Lengths</Spreadsheet.Header.Cell>
                        <Spreadsheet.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    {#each data.collection.indexes as index}
                        <Spreadsheet.Row.Base {root}>
                            <Spreadsheet.Cell column="key" {root}>
                                <Layout.Stack direction="row" alignItems="center">
                                    {index.key}
                                    {#if index.status !== 'available'}
                                        <Badge
                                            size="s"
                                            variant="secondary"
                                            content={index.status}
                                            type={getAttributeStatusBadge(index.status)} />
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
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="type" {root}>{index.type}</Spreadsheet.Cell>
                            <Spreadsheet.Cell column="attributes" {root}>
                                {index.attributes}
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="orders" {root}>
                                {index.orders}
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="lengths" {root}>
                                {index.lengths}
                            </Spreadsheet.Cell>
                            <Spreadsheet.Cell column="actions" {root}>
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
                            </Spreadsheet.Cell>
                        </Spreadsheet.Row.Base>
                    {/each}
                </Spreadsheet.Root>
            </SpreadsheetContainer>
        {:else}
            <EmptySheet
                mode="indexes"
                cta={{
                    primary: {
                        onClick: () => (showCreateIndex = true),
                        disabled: !$collection?.attributes?.length
                    }
                }} />
        {/if}
    {:else}
        <!-- todo: show create attribute if one doesn't exist -->
        <EmptySheet
            mode="indexes"
            title="You have no columns yet"
            cta={{
                primary: {
                    text: 'Create columns',
                    onClick: async () => {
                        await goto(
                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/attributes`
                        );
                    }
                }
            }} />
    {/if}
</div>

<Create bind:showCreateIndex />

{#if selectedIndex}
    <Delete bind:showDelete {selectedIndex} />
    <Overview bind:showOverview {selectedIndex} />
{/if}

{#if showCreateAttribute}
    <CreateAttribute
        bind:showCreate={showCreateAttribute}
        bind:selectedOption={selectedAttribute} />
{/if}

<FailedModal bind:show={showFailed} title="Create index" header="Creation failed" {error} />
