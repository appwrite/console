<script module lang="ts">
    export type CreateIndexesCallbackType = {
        key: string;
        type: IndexType;
        fields: string[];
        lengths: number[];
        orders: string[];
    };
</script>

<script lang="ts">
    import { page } from '$app/state';
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
    import { remove } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { isRelationship, isSpatialType } from '$database/table-[table]/rows/store';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconCalendar, IconFingerPrint, IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { type Entity, getTerminologies } from '$database/(entity)';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { IndexType } from '@appwrite.io/console';
    import { columnOptions as baseColumnOptions } from '$database/table-[table]/columns/store';
    import { IndexOrder } from '$database/(suggestions)';

    let {
        entity,
        showCreateIndex = $bindable(false),
        externalFieldKey = null,
        onCreateIndex
    }: {
        entity: Entity;
        showCreateIndex: boolean;
        externalFieldKey?: string | null;
        onCreateIndex: (index: CreateIndexesCallbackType) => Promise<void>;
    } = $props();

    let key = $state('');
    let initializedForOpen = $state(false);
    let selectedType = $state<IndexType>(IndexType.Key);

    const { dependencies, terminology } = getTerminologies();

    const fieldOptions = $derived(
        entity.fields
            .filter((field) => {
                if (selectedType === IndexType.Spatial) {
                    // keep only spatial
                    return isSpatialType(field);
                }
                // keep non-relationship and non-spatial
                return !isRelationship(field) && !isSpatialType(field);
            })
            .map((field) => ({
                value: field.key,
                label: field.key,
                leadingIcon: baseColumnOptions.find((option) => option.type === field.type)?.icon
            }))
    );

    let fieldList: Array<{
        value: string;
        order: IndexOrder | null;
        length: number | null;
    }> = $state([{ value: '', order: null, length: null }]);

    const types = [
        { value: IndexType.Key, label: 'Key' },
        { value: IndexType.Unique, label: 'Unique' },
        { value: IndexType.Fulltext, label: 'Fulltext' },
        { value: IndexType.Spatial, label: 'Spatial' }
    ];

    // order options derived from selected type
    let orderOptions = $derived.by(() =>
        selectedType === IndexType.Spatial
            ? [
                  { value: 'ASC', label: 'ASC' },
                  { value: 'DESC', label: 'DESC' },
                  { value: null, label: 'NONE' }
              ]
            : [
                  { value: 'ASC', label: 'ASC' },
                  { value: 'DESC', label: 'DESC' }
              ]
    );

    // spatial type selected -> reset field list to single empty field
    // and the field already is not spatial type
    $effect(() => {
        if (selectedType === IndexType.Spatial && !fieldList.at(0).value) {
            fieldList = [{ value: '', order: null, length: null }];
        }
    });

    function generateIndexKey() {
        let indexKeys = entity.indexes.map((index) => index.key);

        let highestIndex = indexKeys.reduce((max, key) => {
            const match = key.match(/^index_(\d+)$/);
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, indexKeys.length);

        return `index_${highestIndex + 1}`;
    }

    function initialize() {
        const field = entity.fields.filter((field) => externalFieldKey === field.key);
        const isSpatial = field.length && isSpatialType(field[0]);
        const order = isSpatial ? null : IndexOrder.ASC;

        selectedType = isSpatial ? IndexType.Spatial : IndexType.Key;

        fieldList = externalFieldKey
            ? [{ value: externalFieldKey, order, length: null }]
            : [{ value: '', order, length: null }];

        key = `index_${entity.indexes.length + 1}`;
    }

    const addFieldDisabled = $derived(
        selectedType === IndexType.Spatial ||
            !fieldList.at(-1)?.value ||
            (!fieldList.at(-1)?.order && fieldList.at(-1)?.order !== null)
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

    export async function create() {
        const fieldType = terminology.field.lower.singular;

        if (!key || !selectedType || (selectedType !== IndexType.Spatial && addFieldDisabled)) {
            addNotification({
                type: 'error',
                message: `Selected ${fieldType} key or type invalid`
            });
            throw new Error(`Selected ${fieldType} key or type invalid`);
        }

        try {
            const orders = fieldList
                .map((field) => field.order)
                .filter((order: IndexOrder) => order !== null)
                .map((order) => String(order));

            await onCreateIndex({
                key,
                type: selectedType,
                fields: fieldList.map((a) => a.value),
                lengths: fieldList.map((a) => (a.length ? Number(a.length) : null)),
                orders: orders.length ? orders : []
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

        // we assign instead of pushing to trigger Svelte's reactivity
        fieldList = [...fieldList, { value: '', order: null, length: null }];
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
            <InputSelect
                required
                options={[
                    // allow system fields only for non-spatial index types
                    ...(selectedType === IndexType.Spatial
                        ? []
                        : [
                              { value: '$id', label: '$id', leadingIcon: IconFingerPrint },
                              {
                                  value: '$createdAt',
                                  label: '$createdAt',
                                  leadingIcon: IconCalendar
                              },
                              {
                                  value: '$updatedAt',
                                  label: '$updatedAt',
                                  leadingIcon: IconCalendar
                              }
                          ]),
                    ...fieldOptions
                ]}
                id={`field-${index}`}
                label={index === 0 ? fieldType : undefined}
                placeholder="Select {fieldType}"
                bind:value={field.value} />

            <InputSelect
                options={orderOptions}
                required
                id={`order-${index}`}
                label={index === 0 ? 'Order' : undefined}
                bind:value={field.order}
                placeholder="Select order" />

            {#if selectedType === IndexType.Key}
                <InputNumber
                    id={`length-${index}`}
                    label={index === 0 ? 'Length' : undefined}
                    placeholder="Enter length"
                    bind:value={field.length} />
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
    <div>
        <Button compact on:click={addField} disabled={addFieldDisabled}>
            <Icon icon={IconPlus} slot="start" size="s" />
            Add {fieldTypeLower}
        </Button>
    </div>
</Layout.Stack>

<style lang="scss">
    .x-button-holder :global(button) {
        width: 34px;
        height: 34px;
    }
</style>
