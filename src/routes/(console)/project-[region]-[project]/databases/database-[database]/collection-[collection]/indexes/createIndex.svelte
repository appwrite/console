<script module lang="ts">
    import { DocumentsDBIndexType, VectorsDBIndexType, OrderBy } from '@appwrite.io/console';
    import type { CreateIndexesCallbackType } from '$database/(entity)';
    import type { DatabaseType } from '$database/(entity)/helpers/terminology';
</script>

<script lang="ts">
    import { page } from '$app/state';
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
    import { remove } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { type Entity, getTerminologies } from '$database/(entity)';
    import { resolveRoute, withPath } from '$lib/stores/navigation';

    let {
        entity,
        databaseType,
        showCreateIndex = $bindable(false),
        onCreateIndex
    }: {
        entity: Entity;
        databaseType: DatabaseType;
        showCreateIndex: boolean;
        onCreateIndex: (index: CreateIndexesCallbackType) => Promise<void>;
    } = $props();

    let key = $state('');
    let initializedForOpen = $state(false);
    let selectedType = $state<string>(
        databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key
    );

    const { dependencies, terminology } = getTerminologies();

    const types = $derived.by(() => {
        if (databaseType === 'vectorsdb') {
            return [
                { value: VectorsDBIndexType.Key, label: 'Key' },
                { value: VectorsDBIndexType.Unique, label: 'Unique' },
                { value: VectorsDBIndexType.HnswEuclidean, label: 'HNSW Euclidean' },
                { value: VectorsDBIndexType.HnswDot, label: 'HNSW Dot' },
                { value: VectorsDBIndexType.HnswCosine, label: 'HNSW Cosine' },
                { value: VectorsDBIndexType.Object, label: 'Object' }
            ];
        }
        return [
            { value: DocumentsDBIndexType.Key, label: 'Key' },
            { value: DocumentsDBIndexType.Unique, label: 'Unique' },
            { value: DocumentsDBIndexType.Fulltext, label: 'Fulltext' }
        ];
    });

    const isHnswType = $derived(
        [
            VectorsDBIndexType.HnswEuclidean,
            VectorsDBIndexType.HnswDot,
            VectorsDBIndexType.HnswCosine
        ].includes(selectedType as VectorsDBIndexType)
    );

    const isObjectType = $derived(selectedType === VectorsDBIndexType.Object);

    const fieldOptions = $derived(
        (entity.fields ?? []).map((field) => ({
            value: field.key,
            label: field.key
        }))
    );

    let fieldList: Array<{
        value: string;
        order: OrderBy | null;
        length: number | null;
    }> = $state([{ value: '', order: OrderBy.Asc, length: null }]);

    const orderOptions = [
        { value: OrderBy.Asc, label: 'ASC' },
        { value: OrderBy.Desc, label: 'DESC' }
    ];

    function generateIndexKey() {
        let indexKeys = entity.indexes.map((index) => index.key);

        let highestIndex = indexKeys.reduce((max, key) => {
            const match = key.match(/^index_(\d+)$/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, indexKeys.length);

        return `index_${highestIndex + 1}`;
    }

    function initialize() {
        selectedType =
            databaseType === 'vectorsdb' ? VectorsDBIndexType.Key : DocumentsDBIndexType.Key;
        fieldList = [{ value: '', order: OrderBy.Asc, length: null }];
        key = `index_${entity.indexes.length + 1}`;
    }

    const addFieldDisabled = $derived(
        isHnswType ||
            isObjectType ||
            !fieldList.at(-1)?.value ||
            (!isObjectType && !fieldList.at(-1)?.order)
    );

    const isOnIndexesPage = $derived(page.route.id?.endsWith('/indexes'));
    const navigatorPathToIndexes = $derived.by(() => {
        const type = terminology.entity.lower.singular;
        const base = resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        );

        return withPath(base, `${type}-${entity.$id}`, 'indexes');
    });

    $effect(() => {
        if (showCreateIndex && !initializedForOpen) {
            initialize();
            key = generateIndexKey();
            initializedForOpen = true;
        }

        if (!showCreateIndex && initializedForOpen) {
            initializedForOpen = false;
        }
    });

    // HNSW indexes: auto-fill embeddings, single field only
    $effect(() => {
        if (isHnswType) {
            fieldList = [{ value: 'embeddings', order: null, length: null }];
        }
    });

    export async function create() {
        const fieldType = terminology.field.lower.singular;

        if (
            !key ||
            !selectedType ||
            (!isHnswType && !isObjectType && addFieldDisabled) ||
            ((isHnswType || isObjectType) && !fieldList.at(0)?.value)
        ) {
            addNotification({
                type: 'error',
                message: `Selected ${fieldType} key or type invalid`
            });
            throw new Error(`Selected ${fieldType} key or type invalid`);
        }

        try {
            await onCreateIndex({
                key,
                type: selectedType,
                fields: fieldList.map((a) => a.value),
                lengths:
                    isHnswType || isObjectType
                        ? []
                        : fieldList.map((a) => (a.length ? Number(a.length) : null)),
                orders:
                    isHnswType || isObjectType
                        ? []
                        : fieldList
                              .map((a) => a.order)
                              .filter((order): order is OrderBy => order !== null)
            });

            await Promise.allSettled([
                invalidate(dependencies.entity.singular),
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
            trackEvent(Submit.IndexCreate, { type: 'manual' });
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

    function addField() {
        if (addFieldDisabled) return;
        fieldList = [...fieldList, { value: '', order: OrderBy.Asc, length: null }];
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

<InputSelect required id="type" options={types} label="Index type" bind:value={selectedType} />

<Layout.Stack gap="s">
    {@const fieldType = terminology.field.title.singular}
    {@const fieldTypeLower = terminology.field.lower.singular}
    {#each fieldList as field, index}
        {@const direction = $isSmallViewport ? 'column' : 'row'}
        <Layout.Stack {direction}>
            {#if isHnswType}
                <InputText
                    required
                    disabled
                    id={`field-${index}`}
                    label={index === 0 ? fieldType : undefined}
                    bind:value={field.value} />
            {:else if fieldOptions.length}
                <InputSelect
                    required
                    options={[
                        { value: '$id', label: '$id' },
                        { value: '$createdAt', label: '$createdAt' },
                        { value: '$updatedAt', label: '$updatedAt' },
                        ...fieldOptions
                    ]}
                    id={`field-${index}`}
                    label={index === 0 ? fieldType : undefined}
                    placeholder="Select {fieldType}"
                    bind:value={field.value} />
            {:else}
                <InputText
                    required
                    id={`field-${index}`}
                    label={index === 0 ? fieldType : undefined}
                    placeholder="Enter {fieldType} name"
                    bind:value={field.value} />
            {/if}

            {#if !isHnswType && !isObjectType}
                <InputSelect
                    options={orderOptions}
                    required
                    id={`order-${index}`}
                    label={index === 0 ? 'Order' : undefined}
                    bind:value={field.order}
                    placeholder="Select order" />

                {#if selectedType === DocumentsDBIndexType.Key || selectedType === VectorsDBIndexType.Key}
                    <InputNumber
                        id={`length-${index}`}
                        label={index === 0 ? 'Length' : undefined}
                        placeholder="Enter length"
                        bind:value={field.length} />
                {/if}
            {/if}

            {#if $isSmallViewport}
                <div style:margin-top="0.25rem">
                    <Button
                        text
                        secondary
                        disabled={fieldList.length <= 1}
                        on:click={() => {
                            fieldList = remove(fieldList, index);
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
                        disabled={fieldList.length <= 1}
                        on:click={() => {
                            fieldList = remove(fieldList, index);
                        }}>
                        <Icon icon={IconX} size="s" />
                    </Button>
                </div>
            {/if}
        </Layout.Stack>
    {/each}
    {#if !isHnswType && !isObjectType}
        <div>
            <Button compact on:click={addField} disabled={addFieldDisabled}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add {fieldTypeLower}
            </Button>
        </div>
    {/if}
</Layout.Stack>

<style lang="scss">
    .x-button-holder :global(button) {
        width: 34px;
        height: 34px;
    }
</style>
