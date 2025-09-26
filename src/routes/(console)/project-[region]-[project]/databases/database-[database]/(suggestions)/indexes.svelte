<script lang="ts">
    import { Icon, Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Button, InputSelect /*InputNumber*/ } from '$lib/elements/forms';
    import {
        showIndexesSuggestions,
        IndexOrder,
        mockSuggestions,
        type SuggestedIndexSchema
    } from './store';
    import { Modal } from '$lib/components';
    import { IndexType } from '@appwrite.io/console';
    import { capitalize } from '$lib/helpers/string';
    import { table } from '../table-[table]/store';
    import { isRelationship } from '../table-[table]/rows/store';
    import { VARS } from '$lib/system';
    import { sleep } from '$lib/helpers/promises';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { onDestroy, onMount } from 'svelte';

    const MAX_INDEXES = 5;

    let modalError = $state(null);
    let creatingIndexes = $state(false);
    let indexes = $state<SuggestedIndexSchema[]>([]);
    let columnOptions: Array<{ value: string; label: string }> = $state();

    const tableId = page.params.table;
    const databaseId = page.params.database;

    function makeColumnOptions() {
        if (VARS.MOCK_AI_SUGGESTIONS) {
            columnOptions = mockSuggestions.columns.map((column) => ({
                value: column.name,
                label: column.name
            }));
        } else {
            columnOptions = $table.columns
                .filter((column) => !isRelationship(column))
                .map((column) => ({
                    value: column.key,
                    label: column.key
                }));
        }
    }

    async function loadIndexSuggestions(): Promise<SuggestedIndexSchema[]> {
        modalError = null;

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
            const suggestions = await sdk
                .forProject(page.params.region, page.params.project)
                .console.suggestIndexes({
                    databaseId,
                    tableId: $table.$id,
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
        }

        makeColumnOptions();

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

    function getOrderOptions(selectedType: IndexType) {
        const base = [IndexOrder.ASC, IndexOrder.DESC];
        const values = selectedType === IndexType.Spatial ? [...base, IndexOrder.NONE] : base;

        return values.map((order) => ({
            label: capitalize(String(order)),
            value: order
        }));
    }

    async function applySuggestedIndexes() {
        modalError = null;
        creatingIndexes = true;

        for (const [i, index] of indexes.entries()) {
            if (!index.key || !index.type) {
                modalError = `Index ${i + 1}: Selected column key or type invalid`;
                creatingIndexes = false;
                return;
            }
        }

        const client = sdk.forProject(page.params.region, page.params.project);
        let successCount = 0;

        for (const [_, index] of indexes.entries()) {
            try {
                const orders = index.orders !== null ? [String(index.orders)] : [];

                await client.tablesDB.createIndex({
                    databaseId,
                    tableId,
                    key: index.key,
                    type: index.type,
                    columns: index.columns,
                    lengths: index.lengths,
                    ...(orders.length ? { orders } : {})
                });

                successCount++;
            } catch (err) {
                if (!modalError) {
                    modalError = err.message;
                }
                trackError(err, Submit.IndexCreate);
                break;
            }
        }

        if (successCount > 0) {
            addNotification({
                message: `${successCount} index${successCount > 1 ? 'es are' : ' is'} being created`,
                type: 'success'
            });

            trackEvent(Submit.IndexCreate, { type: 'suggestions', count: successCount });

            $showIndexesSuggestions = false;
            await invalidate(Dependencies.TABLE);
        }

        creatingIndexes = false;
    }

    const typeOptions = Object.values(IndexType).map((type) => ({
        label: capitalize(type),
        value: type
    }));

    onMount(() => showIndexesSuggestions.set(false));

    onDestroy(() => showIndexesSuggestions.set(false));
</script>

<Modal
    title="Suggested indexes"
    bind:error={modalError}
    bind:show={$showIndexesSuggestions}
    onSubmit={applySuggestedIndexes}>
    <Layout.Stack gap="l">
        {#await loadIndexSuggestions()}
            {#each Array(3) as _, index}
                {@const firstItem = index === 0}
                <Layout.Stack direction="row" justifyContent="space-evenly" alignItems="center">
                    {@render fieldSkeleton({ label: 'Key', showLabel: firstItem })}
                    {@render fieldSkeleton({ label: 'Type', showLabel: firstItem })}
                    {@render fieldSkeleton({ label: 'Order', showLabel: firstItem })}
                    <!--{@render fieldSkeleton({ label: 'Length', showLabel: firstItem })}-->

                    <div style:margin-top={firstItem ? '27.6px' : '0'}>
                        <Skeleton variant="square" width={30} height={30} style="opacity: 0.25" />
                    </div>
                </Layout.Stack>
            {/each}

            <Layout.Stack direction="row" justifyContent="flex-start">
                <Button icon size="s" disabled compact>
                    <Icon icon={IconPlus} size="s" />

                    Add Index
                </Button>
            </Layout.Stack>
        {:then suggestedIndexes}
            {#each suggestedIndexes as index, count}
                {@const firstItem = count === 0}
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <InputSelect
                        id="key-{count}"
                        label={firstItem ? 'Key' : undefined}
                        bind:value={index.key}
                        options={columnOptions}
                        placeholder="Select column"
                        required />

                    <InputSelect
                        id="type-{count}"
                        label={firstItem ? 'Type' : ''}
                        bind:value={index.type}
                        options={typeOptions}
                        required />

                    <InputSelect
                        id="order-{count}"
                        label={firstItem ? 'Order' : ''}
                        bind:value={index.orders}
                        options={getOrderOptions(index.type)}
                        required />

                    <!--<InputNumber
                        id="length-{count}"
                        label={firstItem ? 'Length' : undefined}
                        disabled={index.type === IndexType.Key}
                        placeholder='Lengths'
                        bind:value={index.length}
                    />-->

                    <div style:margin-top={firstItem ? '27.6px' : '0'}>
                        <Button
                            icon
                            size="xs"
                            secondary
                            on:click={() => removeIndex(count)}
                            disabled={indexes.length <= 1}>
                            <Icon icon={IconX} color="--fgcolor-danger-primary" />
                        </Button>
                    </div>
                </Layout.Stack>
            {/each}

            {#if indexes.length < MAX_INDEXES}
                <Layout.Stack direction="row" justifyContent="flex-start">
                    <Button icon size="s" compact on:click={addIndex}>
                        <Icon icon={IconPlus} size="s" />

                        Add Index
                    </Button>
                </Layout.Stack>
            {/if}
        {/await}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center" inline>
            <Layout.Stack direction="row" gap="m">
                <Button text size="s" on:click={() => ($showIndexesSuggestions = false)}
                    >Cancel</Button>

                <Button
                    size="s"
                    submit
                    submissionLoader
                    disabled={indexes.length === 0}
                    forceShowLoader={creatingIndexes}>
                    Create
                </Button>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</Modal>

{#snippet fieldSkeleton({ label, showLabel })}
    <Layout.Stack gap="xxxs">
        {#if showLabel}
            <Typography.Text variant="m-500" style="margin-block-end: var(--gap-s);"
                >{label}</Typography.Text>
        {/if}
        <Skeleton variant="line" width="100%" height={33} style="opacity: 0.25" />
    </Layout.Stack>
{/snippet}
