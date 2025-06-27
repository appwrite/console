<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
    import { remove } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IndexType } from '@appwrite.io/console';
    import { isRelationship } from '../row-[row]/columns/store';
    import { type Columns, table, indexes } from '../store';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { flags } from '$lib/flags';

    export let showCreateIndex = false;
    export let externalColumn: Columns = null;

    const databaseId = page.params.database;

    let key = '';
    let error: string;
    let types = [
        { value: IndexType.Key, label: 'Key' },
        { value: IndexType.Unique, label: 'Unique' },
        { value: IndexType.Fulltext, label: 'FullText' }
    ];
    let selectedType = IndexType.Key;

    let columnOptions = $table.columns
        .filter((column) => !isRelationship(column))
        .map((column) => ({
            value: column.key,
            label: column.key
        }));

    let columnList = [{ value: '', order: '', length: null }];

    const showLengths = flags.showIndexLengths(page.data);

    function generateIndexKey() {
        let indexKeys = $indexes.map((index) => index.key);

        let highestIndex = indexKeys.reduce((max, key) => {
            const match = key.match(/^index_(\d+)$/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, indexKeys.length);

        return `index_${highestIndex + 1}`;
    }

    function initialize() {
        columnList = externalColumn
            ? [{ value: externalColumn.key, order: 'ASC', length: null }]
            : [{ value: '', order: 'ASC', length: null }];
        selectedType = IndexType.Key;
        key = `index_${$indexes.length + 1}`;
    }

    $: if (showCreateIndex) {
        error = null;
        initialize();
        key = generateIndexKey();
    }

    $: addColumnDisabled = !columnList.at(-1)?.value || !columnList.at(-1)?.order;

    async function create() {
        if (!(key && selectedType && !addColumnDisabled)) {
            error = 'All fields are required';
            return;
        }

        try {
            await sdk.forProject(page.params.region, page.params.project).tables.createIndex(
                databaseId,
                $table.$id,
                key,
                selectedType,
                columnList.map((a) => a.value),
                columnList.map((a) => a.order),
                columnList.map((a) => (a.length ? Number(a.length) : null))
            );

            await Promise.allSettled([
                invalidate(Dependencies.TABLE),
                invalidate(Dependencies.DATABASE)
            ]);

            goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${$table.$id}/indexes`
            );

            addNotification({
                message: 'Creating index',
                type: 'success'
            });
            trackEvent(Submit.IndexCreate);
            showCreateIndex = false;
        } catch (err) {
            error = err.message;
            trackError(err, Submit.IndexCreate);
        }
    }

    function addColumn() {
        if (addColumnDisabled) return;

        // We assign instead of pushing to trigger Svelte's reactivity
        columnList = [...columnList, { value: '', order: '', length: null }];
    }
</script>

<Modal title="Create index" bind:error onSubmit={create} bind:show={showCreateIndex}>
    <InputText
        required
        id="key"
        label="Index Key"
        placeholder="Enter Key"
        bind:value={key}
        autofocus />
    <InputSelect required options={types} id="type" label="Index type" bind:value={selectedType} />

    <Layout.Stack gap="s">
        {#each columnList as column, index}
            <Layout.Stack direction="row">
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

                <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                    {#if selectedType === IndexType.Key && showLengths}
                        <InputNumber
                            id={`length-${index}`}
                            label={index === 0 ? 'Length' : undefined}
                            placeholder="Enter length"
                            bind:value={column.length} />
                    {/if}
                    <Button
                        icon
                        compact
                        disabled={columnList.length <= 1}
                        on:click={() => {
                            columnList = remove(columnList, index);
                        }}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </Button>
                </Layout.Stack>
            </Layout.Stack>
        {/each}
        <div>
            <Button compact on:click={addColumn} disabled={addColumnDisabled}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add column
            </Button>
        </div>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreateIndex = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
