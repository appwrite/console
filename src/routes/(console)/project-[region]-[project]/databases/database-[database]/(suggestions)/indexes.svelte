<script lang="ts">
    import { Alert, Accordion, Icon, Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Button, InputSelect /*InputNumber*/ } from '$lib/elements/forms';
    import {
        showIndexesSuggestions,
        IndexOrder,
        mockSuggestions,
        type SuggestedIndexSchema
    } from './store';
    import { Modal, Confirm } from '$lib/components';
    import { SideSheet } from '$database/(entity)';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IndexType, type Models } from '@appwrite.io/console';
    import { capitalize } from '$lib/helpers/string';
    import { type Columns, table } from '../table-[table]/store';
    import { isRelationship } from '../table-[table]/rows/store';
    import { VARS } from '$lib/system';
    import { sleep } from '$lib/helpers/promises';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { type ComponentType, onDestroy, onMount } from 'svelte';
    import { columnOptions as baseColumnOptions } from '../table-[table]/columns/store';

    const MAX_INDEXES = 5;

    let modalError = $state(null);
    let creatingIndexes = $state(false);
    let loadingSuggestions = $state(false);
    let indexes = $state<SuggestedIndexSchema[]>([]);
    let confirmDismiss = $state(false);
    let columnOptions: Array<{
        value: string;
        label: string;
        leadingIcon?: ComponentType;
    }> = $state();

    const tableId = page.params.table;
    const databaseId = page.params.database;

    function makeColumnOptions() {
        if (VARS.MOCK_AI_SUGGESTIONS) {
            columnOptions = mockSuggestions.columns.map((column) => ({
                value: column.name,
                label: column.name,
                leadingIcon: baseColumnOptions.find((option) => option.type === column.type)?.icon
            }));
        } else {
            columnOptions = $table.columns
                .filter((column) => !isRelationship(column))
                .map((column) => ({
                    value: column.key,
                    label: column.key,
                    leadingIcon: baseColumnOptions.find((option) => option.type === column.type)
                        ?.icon
                }));
        }
    }

    async function loadIndexSuggestions(): Promise<SuggestedIndexSchema[]> {
        modalError = null;
        loadingSuggestions = true;

        if (VARS.MOCK_AI_SUGGESTIONS) {
            await sleep(1250);

            indexes = mockSuggestions.columns.slice(0, 3).map((column, index) => ({
                key: column.name,
                type: IndexType.Key,
                columns: [column.name],
                orders: index === 2 ? IndexOrder.DESC : IndexOrder.ASC,
                lengths: []
            }));
        } else {
            try {
                const suggestions = await sdk
                    .forProject(page.params.region, page.params.project)
                    .console.suggestIndexes({
                        databaseId,
                        tableId: $table.$id
                    });

                indexes = suggestions.indexes.map((index) => {
                    return {
                        key: index.columns[0],
                        type: index.type as IndexType,
                        orders: (index.orders?.[0] as IndexOrder) || IndexOrder.ASC,
                        columns: index.columns,
                        lengths: index.lengths ?? []
                    };
                });
            } catch (error) {
                addNotification({
                    type: 'error',
                    message: error.message
                });

                await closeAndInvalidate();
                return []; // formality, UI is closed by now!
            }
        }

        makeColumnOptions();

        loadingSuggestions = false;

        return indexes;
    }

    function addIndex() {
        if (indexes.length < MAX_INDEXES) {
            indexes.push({
                key: '',
                type: IndexType.Key,
                orders: IndexOrder.ASC,
                columns: [],
                lengths: null
            });
        }
    }

    function removeIndex(index: number) {
        indexes.splice(index, 1);
    }

    function syncIndexState(event: CustomEvent, index: SuggestedIndexSchema) {
        const selected = event.detail;
        index.key = selected;
        index.columns = selected ? [selected] : [];
        if (index.lengths) {
            index.lengths = index.lengths.slice(0, index.columns.length);
        }
    }

    function getOrderOptions(selectedType: IndexType) {
        const base = [IndexOrder.ASC, IndexOrder.DESC];
        const values = selectedType === IndexType.Spatial ? [...base, IndexOrder.NONE] : base;

        return values.map((order) => ({
            label: capitalize(String(order)),
            value: order
        }));
    }

    function generateUniqueIndexKey(index: SuggestedIndexSchema, usedKeys: Set<string>): string {
        const existingKeys = $table.indexes.map((idx) => idx.key);
        let suggestedKey = `${index.key || index.columns[0]}_${index.type.toLowerCase()}`;
        let uniqueKey = suggestedKey;
        let counter = 1;

        while (existingKeys.includes(uniqueKey) || usedKeys.has(uniqueKey)) {
            uniqueKey = `${suggestedKey}_${counter}`;
            counter++;
        }

        usedKeys.add(uniqueKey);
        return uniqueKey;
    }

    function prepareIndexForCreation(index: SuggestedIndexSchema, columnMap: Map<string, Columns>) {
        // prepare orders array
        const orders = index.orders !== null ? index.columns.map(() => String(index.orders)) : [];

        // prepare lengths array
        let lengths: (number | null)[];
        if (index.type === IndexType.Key) {
            // only validate if it's a key index
            lengths = index.columns.map((columnKey, i) => {
                const column = columnMap.get(columnKey);
                if (column?.type === 'string') {
                    const stringColumn = column as Models.ColumnString;
                    const requestedLength = index.lengths?.[i];
                    if (
                        requestedLength &&
                        stringColumn.size &&
                        requestedLength > stringColumn.size
                    ) {
                        return stringColumn.size;
                    }
                    return requestedLength || null;
                }
                return null;
            });
        } else {
            // non-key indexes, lengths are null!
            lengths = Array(index.columns.length).fill(null);
        }

        return { orders, lengths };
    }

    function dismissIndexes() {
        indexes = [];
        confirmDismiss = false;
        $showIndexesSuggestions = false;
    }

    async function closeAndInvalidate() {
        // close modal/sheet.
        $showIndexesSuggestions = false;

        /**
         * Invalidate dependencies after modal/sheet close,
         * because otherwise the `await` block will re-run in the modal.
         */
        await invalidate(Dependencies.TABLE);
    }

    async function applySuggestedIndexes(): Promise<boolean> {
        modalError = null;
        creatingIndexes = true;

        for (const [i, index] of indexes.entries()) {
            if (!index.key || !index.type || !index.columns || index.columns.length === 0) {
                modalError = `Index ${i + 1}: Selected column or type invalid`;
                creatingIndexes = false;
                return true; // keep sheet open!
            }
        }

        let successCount = 0;
        const usedKeys = new Set<string>();
        const columnMap = new Map($table.columns.map((col) => [col.key, col]));
        const sdkClient = sdk.forProject(page.params.region, page.params.project);

        for (const [_, index] of indexes.entries()) {
            try {
                // prepare and validate index data
                const { orders, lengths } = prepareIndexForCreation(index, columnMap);

                // generate unique key name for the index
                const uniqueIndexKey = generateUniqueIndexKey(index, usedKeys);

                await sdkClient.tablesDB.createIndex({
                    databaseId,
                    tableId,
                    key: uniqueIndexKey,
                    type: index.type,
                    columns: index.columns,
                    lengths,
                    ...(orders.length ? { orders } : {})
                });

                successCount++;
            } catch (error) {
                if (!modalError) {
                    modalError = error.message;
                }
                trackError(error, Submit.IndexCreate);
                creatingIndexes = false;
                return true; // keep sheet open!
            }
        }

        creatingIndexes = false;

        if (successCount > 0) {
            trackEvent(Submit.IndexCreate, { type: 'suggestions', count: successCount });
        }

        if (successCount === indexes.length) {
            // all succeeded
            addNotification({
                message: `${successCount} index${successCount > 1 ? 'es are' : ' is'} being created`,
                type: 'success'
            });

            await closeAndInvalidate();
        } else if (successCount > 0) {
            // some succeeded, some failed
            addNotification({
                message: 'Some indexes could not be created',
                type: 'warning'
            });

            await closeAndInvalidate();
        } else {
            // all failed
            addNotification({
                message: 'Failed to create indexes',
                type: 'error'
            });

            return true; // keep sheet open!
        }

        return false; // close the sheet!
    }

    const typeOptions = Object.values(IndexType).map((type) => ({
        label: capitalize(type),
        value: type
    }));

    onMount(() => showIndexesSuggestions.set(false));

    onDestroy(() => showIndexesSuggestions.set(false));
</script>

{#if !$isSmallViewport}
    <Modal
        dismissible={false}
        title="Suggested indexes"
        bind:error={modalError}
        bind:show={$showIndexesSuggestions}
        onSubmit={async () => {
            await applySuggestedIndexes();
        }}>
        <Layout.Stack gap="m">
            {#await loadIndexSuggestions()}
                <Layout.Stack gap="xs">
                    <Layout.Stack gap="m">
                        {#each Array(3) as _, index}
                            {@const firstItem = index === 0}
                            <Layout.Stack gap="m" direction="row" alignItems="center">
                                {@render fieldSkeleton({ label: 'Column', showLabel: firstItem })}
                                {@render fieldSkeleton({ label: 'Type', showLabel: firstItem })}
                                {@render fieldSkeleton({ label: 'Order', showLabel: firstItem })}
                                <!--{@render fieldSkeleton({ label: 'Length', showLabel: firstItem })}-->

                                <div style:margin-top={firstItem ? '27.6px' : '0'}>
                                    <Skeleton
                                        variant="square"
                                        width="33px"
                                        height="33px"
                                        style="opacity: 0.25" />
                                </div>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                    {@render addIndexButton()}
                </Layout.Stack>
            {:then suggestedIndexes}
                <Layout.Stack gap="xs">
                    <Layout.Stack gap="m">
                        {#each suggestedIndexes as index, count}
                            {@render indexEditForm({ index, count, isDesktop: true })}
                        {/each}
                    </Layout.Stack>

                    {@render addIndexButton()}
                </Layout.Stack>
            {/await}
        </Layout.Stack>

        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center" inline>
                <Layout.Stack direction="row" gap="m">
                    <Button
                        text
                        size="s"
                        disabled={loadingSuggestions || creatingIndexes}
                        on:click={() => {
                            if (indexes.length > 0 && !creatingIndexes) {
                                confirmDismiss = true;
                            } else {
                                $showIndexesSuggestions = false;
                            }
                        }}>Cancel</Button>

                    <Button
                        size="s"
                        submit
                        submissionLoader
                        disabled={indexes.length === 0 || loadingSuggestions}
                        forceShowLoader={creatingIndexes}>
                        Create
                    </Button>
                </Layout.Stack>
            </Layout.Stack>
        </svelte:fragment>
    </Modal>
{/if}

{#if $isSmallViewport}
    <SideSheet
        closeOnBlur={false}
        title="Suggested indexes"
        data-index-edit-form-sheet
        bind:show={$showIndexesSuggestions}
        submit={{
            text: 'Create',
            disabled: indexes.length === 0 || creatingIndexes || loadingSuggestions,
            onClick: async () => await applySuggestedIndexes()
        }}
        cancel={{
            disabled: loadingSuggestions || creatingIndexes,
            onClick: () => {
                if (indexes.length > 0 && !creatingIndexes) {
                    confirmDismiss = true;
                } else {
                    $showIndexesSuggestions = false;
                }
            }
        }}>
        {#if modalError}
            <Alert.Inline status="error">
                {modalError}
            </Alert.Inline>
        {/if}

        {#await loadIndexSuggestions()}
            <Layout.Stack gap="m" alignItems="center">
                {#each Array(3) as _}
                    {@render fieldSkeleton({
                        label: undefined,
                        showLabel: false,
                        isDesktop: false
                    })}
                {/each}
            </Layout.Stack>
        {:then suggestedIndexes}
            <Layout.Stack gap="s">
                {#each suggestedIndexes as index, count}
                    <Accordion title="{index.key}_index">
                        {@render indexEditForm({ index, count, isDesktop: false })}
                    </Accordion>
                {/each}

                {@render addIndexButton()}
            </Layout.Stack>
        {/await}
    </SideSheet>
{/if}

{#snippet fieldSkeleton({ label, showLabel, isDesktop = true })}
    <Layout.Stack gap="xxxs">
        {#if showLabel}
            <Typography.Text variant="m-500" style="margin-block-end: var(--gap-s);"
                >{label}</Typography.Text>
        {/if}
        <Skeleton
            variant="line"
            width="100%"
            height={isDesktop ? 33.602 : 39.398}
            style="opacity: 0.25" />
    </Layout.Stack>
{/snippet}

{#snippet indexEditForm({ index, count, isDesktop = true })}
    {@const firstItem = count === 0}
    {#if isDesktop}
        <Layout.Stack gap="m" direction="row" alignItems="center" class="desktop-selects-form">
            <InputSelect
                id="key-{count}"
                label={firstItem ? 'Column' : undefined}
                bind:value={index.key}
                on:change={(event) => syncIndexState(event, index)}
                options={columnOptions}
                placeholder="Select column"
                required
                disabled={creatingIndexes} />

            <InputSelect
                id="type-{count}"
                label={firstItem ? 'Type' : ''}
                bind:value={index.type}
                options={typeOptions}
                required
                disabled={creatingIndexes} />

            <InputSelect
                id="order-{count}"
                label={firstItem ? 'Order' : ''}
                bind:value={index.orders}
                options={getOrderOptions(index.type)}
                required
                disabled={creatingIndexes} />

            {@render removeIndexButton({ count, isDesktop: true })}
        </Layout.Stack>
    {:else}
        <!-- Mobile: Vertical layout -->
        <Layout.Stack gap="m">
            <Layout.Stack gap="s">
                <InputSelect
                    id="key-{count}-mobile"
                    bind:value={index.key}
                    on:change={(event) => syncIndexState(event, index)}
                    options={columnOptions}
                    placeholder="Select column"
                    required />

                <InputSelect
                    id="type-{count}-mobile"
                    bind:value={index.type}
                    options={typeOptions}
                    required />

                <InputSelect
                    id="order-{count}-mobile"
                    bind:value={index.orders}
                    options={getOrderOptions(index.type)}
                    required />
            </Layout.Stack>

            {@render removeIndexButton({ count, isDesktop: false })}
        </Layout.Stack>
    {/if}
{/snippet}

{#snippet addIndexButton()}
    {#if indexes.length < MAX_INDEXES}
        <Layout.Stack direction="row" justifyContent="flex-start">
            <Button
                icon
                size="s"
                compact
                on:click={addIndex}
                disabled={loadingSuggestions || creatingIndexes}>
                <Icon icon={IconPlus} size="s" />
                Add Index
            </Button>
        </Layout.Stack>
    {/if}
{/snippet}

{#snippet removeIndexButton({ count, isDesktop = true })}
    {#if isDesktop}
        <div style:margin-top={count === 0 ? '27.6px' : '0'}>
            <Button
                icon
                size="xs"
                secondary
                on:click={() => removeIndex(count)}
                disabled={indexes.length <= 1 || creatingIndexes}>
                <Icon icon={IconX} color="--fgcolor-danger-primary" />
            </Button>
        </div>
    {:else if indexes.length > 1}
        <Layout.Stack direction="row" justifyContent="flex-start">
            <Button
                size="s"
                secondary
                on:click={() => removeIndex(count)}
                disabled={indexes.length <= 1 || creatingIndexes}>Delete</Button>
        </Layout.Stack>
    {/if}
{/snippet}

<Confirm
    confirmDeletion
    action="Dismiss"
    title="Dismiss indexes"
    bind:open={confirmDismiss}
    onSubmit={dismissIndexes}>
    Are you sure you want to dismiss these suggested indexes? This action cannot be undone.
</Confirm>

<style lang="scss">
    // Custom logic to hide the Sheet's
    // `X` close button (not configurable via props)
    :global([data-index-edit-form-sheet] header) {
        & :global(.divider),
        & :global(button) {
            visibility: hidden !important;
        }
    }

    // stack > div > input-select button!
    :global(.desktop-selects-form :first-child button:first-of-type) {
        width: 164px;
        max-width: 164px;
    }
</style>
