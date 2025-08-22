<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
    import { remove } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IndexType } from '@appwrite.io/console';
    import { isRelationship } from '../rows/store';
    import { table, indexes } from '../store';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        showCreateIndex = $bindable(false),
        externalColumnKey = null
    }: {
        showCreateIndex: boolean;
        externalColumnKey?: string;
    } = $props();

    const databaseId = page.params.database;

    let key = $state('');
    let types = [
        { value: IndexType.Key, label: 'Key' },
        { value: IndexType.Unique, label: 'Unique' },
        { value: IndexType.Fulltext, label: 'Fulltext' }
    ];

    let selectedType = $state(IndexType.Key);

    let columnOptions = $table.columns
        .filter((column) => !isRelationship(column))
        .map((column) => ({
            value: column.key,
            label: column.key
        }));

    let columnList = $state([{ value: '', order: '', length: null }]);

    function generateIndexKey() {
        let indexKeys = $indexes.map((index) => index.key);

        let highestIndex = indexKeys.reduce((max, key) => {
            const match = key.match(/^index_(\d+)$/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, indexKeys.length);

        return `index_${highestIndex + 1}`;
    }

    function initialize() {
        columnList = externalColumnKey
            ? [{ value: externalColumnKey, order: 'ASC', length: null }]
            : [{ value: '', order: 'ASC', length: null }];
        selectedType = IndexType.Key;
        key = `index_${$indexes.length + 1}`;
    }

    const addColumnDisabled = $derived(!columnList.at(-1)?.value || !columnList.at(-1)?.order);

    const isOnIndexesPage = $derived(page.route.id?.endsWith('/indexes'));
    const navigatorPathToIndexes = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${$table?.$id}/indexes`
    );

    $effect(() => {
        if (showCreateIndex) {
            initialize();
            key = generateIndexKey();
        }
    });

    export async function create() {
        if (!(key && selectedType && !addColumnDisabled)) {
            addNotification({
                type: 'error',
                message: 'Selected column key or type invalid'
            });
            throw new Error('Selected column key or type invalid');
        }

        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDb.createIndex({
                databaseId,
                tableId: $table.$id,
                key,
                type: selectedType,
                columns: columnList.map((a) => a.value),
                orders: columnList.map((a) => a.order),
                lengths: columnList.map((a) => (a.length ? Number(a.length) : null))
            });

            await Promise.allSettled([
                invalidate(Dependencies.TABLE),
                invalidate(Dependencies.DATABASE)
            ]);

            addNotification({
                message: 'Index is being created',
                type: 'success',
                buttons: !isOnIndexesPage
                    ? [
                          {
                              name: 'View indexes',
                              method: () => goto(navigatorPathToIndexes)
                          }
                      ]
                    : undefined
            });
            trackEvent(Submit.IndexCreate);
            showCreateIndex = false;
        } catch (err) {
            addNotification({
                type: 'error',
                message: err.message
            });
            trackError(err, Submit.IndexCreate);
            throw err;
        }
    }

    function addColumn() {
        if (addColumnDisabled) return;

        // We assign instead of pushing to trigger Svelte's reactivity
        columnList = [...columnList, { value: '', order: '', length: null }];
    }
</script>

<InputText
    required
    id="key"
    label="Index Key"
    pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$"
    placeholder="Enter Key"
    bind:value={key}
    autofocus />

<InputSelect required options={types} id="type" label="Index type" bind:value={selectedType} />

<Layout.Stack gap="s">
    {#each columnList as column, index}
        {@const direction = $isSmallViewport ? 'column' : 'row'}
        <Layout.Stack {direction}>
            <InputSelect
                required
                options={[
                    { value: '$id', label: '$id' },
                    { value: '$createdAt', label: '$createdAt' },
                    { value: '$updatedAt', label: '$updatedAt' },
                    ...columnOptions
                ]}
                id={`column-${index}`}
                label={index === 0 ? 'Column' : undefined}
                placeholder="Select column"
                bind:value={column.value} />

            <InputSelect
                options={[
                    { value: 'ASC', label: 'ASC' },
                    { value: 'DESC', label: 'DESC' }
                ]}
                required
                id={`order-${index}`}
                label={index === 0 ? 'Order' : undefined}
                bind:value={column.order}
                placeholder="Select order" />

            {#if selectedType === IndexType.Key}
                <InputNumber
                    id={`length-${index}`}
                    label={index === 0 ? 'Length' : undefined}
                    placeholder="Enter length"
                    bind:value={column.length} />
            {/if}

            {#if $isSmallViewport}
                <div style:margin-top="0.25rem">
                    <Button
                        text
                        secondary
                        disabled={columnList.length <= 1}
                        on:click={() => {
                            columnList = remove(columnList, index);
                        }}>
                        Remove
                    </Button>
                </div>
            {:else}
                <div style:margin-top="27.6px" class="x-button-holder">
                    <Button
                        icon
                        size="s"
                        secondary
                        disabled={columnList.length <= 1}
                        on:click={() => {
                            columnList = remove(columnList, index);
                        }}>
                        <Icon icon={IconX} size="s" />
                    </Button>
                </div>
            {/if}
        </Layout.Stack>
    {/each}
    <div>
        <Button compact on:click={addColumn} disabled={addColumnDisabled}>
            <Icon icon={IconPlus} slot="start" size="s" />
            Add column
        </Button>
    </div>
</Layout.Stack>

<style lang="scss">
    .x-button-holder :global(button) {
        width: 34px;
        height: 34px;
    }
</style>
