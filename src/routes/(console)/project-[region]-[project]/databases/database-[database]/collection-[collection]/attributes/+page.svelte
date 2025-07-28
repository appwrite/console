<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { canWriteCollections } from '$lib/stores/roles';
    import {
        ActionMenu,
        Badge,
        FloatingActionBar,
        Icon,
        Layout,
        Link,
        Popover,
        Selector,
        Spreadsheet,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { isRelationship, isString } from '../document-[document]/attributes/store';
    import FailedModal from '../failedModal.svelte';
    import CreateIndex from '../indexes/createIndex.svelte';
    import {
        attributes,
        type Attributes,
        indexes,
        isCsvImportInProgress,
        reorderItems
    } from '../store';
    import Delete from './deleteAttribute.svelte';
    import EditAttribute from './edit.svelte';
    import { attributeOptions } from './store';
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
        IconLockClosed,
        IconFingerPrint
    } from '@appwrite.io/pink-icons-svelte';
    import { type ComponentProps, onDestroy, onMount } from 'svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import CsvDisabled from '../csvDisabled.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SideSheet from '../layout/sidesheet.svelte';
    import SpreadsheetContainer from '../layout/spreadsheet.svelte';
    import { showCreateAttributeSheet } from '../store';
    import { type Models } from '@appwrite.io/console';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/state';

    const updatedAttributes = $derived.by(() => {
        const baseAttrs = [
            {
                key: '$id',
                type: 'string',
                required: true,
                name: 'ID',
                selectable: false,
                system: true
            } as Models.AttributeString & {
                name: string;
                selectable: boolean;
                system: boolean;
            },
            ...$attributes,
            {
                key: '$createdAt',
                type: 'datetime',
                required: true,
                name: 'createdAt',
                selectable: false,
                system: true
            } as Models.AttributeDatetime & {
                name: string;
                selectable: boolean;
                system: boolean;
            },
            {
                key: '$updatedAt',
                type: 'datetime',
                required: true,
                name: 'updatedAt',
                selectable: false,
                system: true
            } as Models.AttributeDatetime & {
                name: string;
                selectable: boolean;
                system: boolean;
            }
        ];

        return reorderItems(baseAttrs, columnsOrder);
    });

    let error = $state('');
    let showDropdown = $state([]);
    let showFailed = $state(false);
    let showDelete = $state(false);
    let selectedAttributes = $state([]);
    let showCreateIndex = $state(false);
    let selectedAttribute: Attributes = $state(null);

    let columnsOrder = $state([]);
    const collectionId = page.params.collection;

    let showEdit = $state(false);
    let createIndex: CreateIndex;
    let editAttribute: EditAttribute;

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

    const emptyCellsLimit = $derived($isSmallViewport ? 14 : 16);
    const emptyCellsCount = $derived(
        $attributes.length >= emptyCellsLimit ? 0 : emptyCellsLimit - $attributes.length
    );

    onMount(() => {
        columnsOrder = preferences.getColumnOrder(collectionId);
    });

    onDestroy(() => ($showCreateAttributeSheet.show = false));
</script>

<Container expanded style="background: var(--bgcolor-neutral-primary)">
    <Layout.Stack direction="row" justifyContent="flex-end">
        {#if $canWriteCollections}
            <Button
                size="s"
                secondary
                disabled={$isCsvImportInProgress}
                on:click={() => {
                    $showCreateAttributeSheet.show = true;
                }}
                event="create_attribute">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create column
            </Button>
        {/if}
    </Layout.Stack>
</Container>

<div class="databases-spreadsheet">
    <SpreadsheetContainer>
        <Spreadsheet.Root
            let:root
            allowSelection
            height="100%"
            emptyCells={emptyCellsCount}
            bind:selectedRows={selectedAttributes}
            columns={[
                { id: 'key', width: { min: 200 } },
                { id: 'indexed', width: { min: 150 } },
                { id: 'default', width: { min: 200 } },
                { id: 'actions', width: 40, isAction: true }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Spreadsheet.Header.Cell column="key" {root}>Column name</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="indexed" {root}>Indexed</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="default" {root}
                    >Default value</Spreadsheet.Header.Cell>
                <Spreadsheet.Header.Cell column="actions" {root} />
            </svelte:fragment>

            {#each updatedAttributes as attribute, index}
                {@const option = attributeOptions.find((option) => option.type === attribute.type)}
                {@const isSelectable =
                    attribute['system'] || attribute.type === 'relationship' ? 'disabled' : true}
                <Spreadsheet.Row.Base {root} select={isSelectable} id={attribute.key}>
                    <Spreadsheet.Cell column="key" {root} isEditable={false}>
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
                            {:else if attribute.key === '$id'}
                                <Icon icon={IconFingerPrint} size="s" />
                            {:else}
                                <Icon icon={option.icon} size="s" />
                            {/if}

                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Layout.Stack inline direction="row" alignItems="center" gap="xxs">
                                    <span class="text u-trim-1" data-private>
                                        {#if attribute.key === '$id' || attribute.key === '$createdAt' || attribute.key === '$updatedAt'}
                                            {attribute['name']}
                                            {#if attribute.key === '$id'}
                                                <Badge
                                                    size="xs"
                                                    variant="secondary"
                                                    content="Primary key" />
                                            {/if}
                                        {:else}
                                            {attribute.key}
                                        {/if}
                                    </span>
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
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="indexed" {root} isEditable={false}>
                        {@const isIndexed = $indexes.some((index) =>
                            index.attributes.includes(attribute.key)
                        )}
                        <Selector.Checkbox size="s" checked={isIndexed} disabled />
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="default" {root} isEditable={false}>
                        {@const _default =
                            attribute?.default !== null && attribute?.default !== undefined
                                ? attribute?.default
                                : null}

                        {#if _default === null}
                            <Badge variant="secondary" content="NULL" size="xs" />
                        {:else}
                            {_default}
                        {/if}
                    </Spreadsheet.Cell>
                    <Spreadsheet.Cell column="actions" {root} isEditable={false}>
                        {#if $isCsvImportInProgress}
                            <CsvDisabled>
                                <Button disabled text icon ariaLabel="more options">
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                            </CsvDisabled>
                        {:else}
                            <!-- TODO: no portal, rather see if we can fix the cell -->
                            <Popover let:toggle padding="none" placement="bottom-end" portal>
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip" let:toggle>
                                    {#if !attribute['system']}
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
                                    {/if}
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
                                    {#if attribute.status !== 'processing' && !attribute['system']}
                                        <ActionMenu.Item.Button
                                            status="danger"
                                            leadingIcon={IconTrash}
                                            on:click={(event) => {
                                                toggle(event);
                                                showDelete = true;
                                                showDropdown[index] = false;
                                                selectedAttribute = attribute;
                                                trackEvent(Click.DatabaseAttributeDelete);
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    {/if}
                                </ActionMenu.Root>
                            </Popover>
                        {/if}
                    </Spreadsheet.Cell>
                </Spreadsheet.Row.Base>
            {/each}

            <svelte:fragment slot="footer">
                <Layout.Stack
                    direction="row"
                    alignContent="center"
                    alignItems="center"
                    justifyContent="space-between">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        {updatedAttributes.length} columns
                    </Typography.Text>
                </Layout.Stack>
            </svelte:fragment>
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    {#if selectedAttributes.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedAttributes.length.toString()} />
                            <span style:font-size="14px">
                                {selectedAttributes.length > 1 ? 'attributes' : 'attribute'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button text on:click={() => (selectedAttributes = [])}>Cancel</Button>
                    <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

{#if selectedAttribute}
    <Delete bind:showDelete {selectedAttribute} />
{:else if selectedAttributes && selectedAttributes.length}
    <Delete bind:showDelete bind:selectedAttribute={selectedAttributes} />
{/if}

<SideSheet
    title="Edit column"
    bind:show={showEdit}
    submit={{
        text: 'Update',
        onClick: async () => await editAttribute.submit()
    }}>
    <EditAttribute showEdit isModal={false} {selectedAttribute} bind:this={editAttribute} />
</SideSheet>

<SideSheet
    title="Create index"
    bind:show={showCreateIndex}
    submit={{
        text: 'Create',
        onClick: async () => await createIndex.create()
    }}>
    <CreateIndex
        bind:showCreateIndex
        externalAttribute={selectedAttribute}
        bind:this={createIndex} />
</SideSheet>

{#if showFailed}
    <FailedModal bind:show={showFailed} title="Create attribute" header="Creation failed" {error} />
{/if}
