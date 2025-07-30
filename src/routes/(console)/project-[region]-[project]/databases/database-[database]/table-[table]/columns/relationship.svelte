<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { ID, type Models, Query, RelationMutate, RelationshipType } from '@appwrite.io/console';

    export async function submitRelationship(
        databaseId: string,
        tableId: string,
        _key: string,
        data: Partial<Models.ColumnRelationship>
    ) {
        if (!isValueOfStringEnum(RelationshipType, data.relationType)) {
            throw new Error(
                `Invalid relationship type${data.relationType ? ` : ${data.relationType}` : ''}`
            );
        }
        if (!isValueOfStringEnum(RelationMutate, data.onDelete)) {
            throw new Error(`Invalid deletion method${data.onDelete ? ` : ${data.onDelete}` : ''}`);
        }

        await sdk
            .forProject(page.params.region, page.params.project)
            .grids.createRelationshipColumn(
                databaseId,
                tableId,
                data.relatedTable,
                data.relationType,
                data.twoWay,
                data.key,
                data.twoWayKey ?? ID.unique(),
                data.onDelete
            );
    }

    export async function updateRelationship(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnRelationship>,
        originalKey?: string
    ) {
        if (!isValueOfStringEnum(RelationMutate, data.onDelete)) {
            throw new Error(`Invalid on delete: ${data.onDelete}`);
        }

        await sdk
            .forProject(page.params.region, page.params.project)
            .grids.updateRelationshipColumn(
                databaseId,
                tableId,
                originalKey,
                data.onDelete,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { InputText, InputSelect } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { Box } from '$lib/components';
    import { table } from '../store';
    import arrowOne from './arrow-one.svg';
    import arrowTwo from './arrow-two.svg';
    import { camelize } from '$lib/helpers/string';
    import { Card, Layout, Input } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight, IconSwitchHorizontal } from '@appwrite.io/pink-icons-svelte';
    import { debounce } from '$lib/helpers/debounce';

    // Props
    export let editing = false;
    export let data: Models.ColumnRelationship;

    // Constants
    const databaseId = page.params.database;
    const relationshipType = [
        { value: 'oneToOne', label: 'One to one' },
        { value: 'oneToMany', label: 'One to many' },
        { value: 'manyToOne', label: 'Many to one' },
        { value: 'manyToMany', label: 'Many to many' }
    ];

    const deleteOptions = [
        { value: 'setNull', label: 'Set NULL - set row ID as NULL in all related rows' },
        { value: 'cascade', label: 'Cascade - delete all related rows' },
        { value: 'restrict', label: 'Restrict - row can not be deleted' }
    ];

    // Variables
    let way = 'one';
    let search = undefined;
    let tableList: Models.TableList;
    let originalTableList: Models.TableList;

    // Lifecycle hooks
    async function getTables() {
        const queries = [Query.limit(100)];
        return sdk
            .forProject(page.params.region, page.params.project)
            .grids.listTables(databaseId, queries, search);
    }

    const debouncedFetchTables = debounce(async () => {
        tableList = await getTables();
        // reset search
        search = undefined;
    }, 500);

    function updateKeyName() {
        if (!editing) {
            const collection = tableList.tables.find((n) => n.$id === data.relatedTable);
            data.key = camelize(collection.name);
        }
    }

    onMount(async () => {
        tableList = await getTables();
        originalTableList = tableList;
    });

    // Reactive statements
    $: tables = tableList?.tables?.filter((n) => n.$id !== $table.$id) ?? [];

    $: if (editing) {
        way = data.twoWay ? 'two' : 'one';
    } else {
        if (way === 'two') {
            data.twoWay = true;
            if (!data.twoWayKey) {
                data.twoWayKey = camelize($table.name);
            }
        } else {
            data.twoWay = false;
        }
    }

    $: search = data.relatedTable || undefined;

    $: if (search) {
        const exists = tableList?.tables?.some((c) =>
            c.$id.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        );

        if (!exists) {
            debouncedFetchTables();
        }
    } else if (!tableList?.total) {
        // reset to original list!
        tableList = originalTableList;
    }
</script>

<Layout.Stack direction="row" wrap="wrap">
    <Card.Selector
        title="One-way relationship"
        bind:group={way}
        name="one"
        value="one"
        icon={IconArrowSmRight}>
        One Relation column within this table
    </Card.Selector>
    <Card.Selector
        title="Two-way relationship"
        bind:group={way}
        name="two"
        value="two"
        icon={IconSwitchHorizontal}>
        One Relation column within this table and another within the related table
    </Card.Selector>
</Layout.Stack>

<Input.ComboBox
    required
    id="related"
    label="Related table"
    placeholder="Select a table"
    bind:value={data.relatedTable}
    on:change={updateKeyName}
    options={tables?.map((n) => ({ value: n.$id, label: `${n.name} (${n.$id})` })) ?? []} />

{#if data?.relatedTable}
    <InputText
        id="key"
        label="Column key"
        placeholder="Enter key"
        bind:value={data.key}
        helper="Allowed characters: a-z, A-Z, 0-9, -, ."
        required />
    {#if way === 'two'}
        <InputText
            id="keyRelated"
            label="Column key (related table)"
            placeholder="Enter key"
            bind:value={data.twoWayKey}
            required
            helper="Allowed characters: a-z, A-Z, 0-9, -, . Once created, column key cannot be
                adjusted to maintain data integrity."
            readonly={editing} />
    {/if}

    <InputSelect
        id="relationship"
        label="Relation"
        bind:value={data.relationType}
        required
        placeholder="Select a relation"
        options={relationshipType}
        disabled={editing} />

    <div class="u-flex u-flex-vertical u-gap-16">
        <Box>
            <div class="u-flex u-align u-cross-center u-main-center u-gap-32">
                <span data-private>{camelize($table.name)}</span>
                {#if data.twoWay}
                    <img src={arrowTwo} alt={'Two way relationship'} />
                {:else}
                    <img src={arrowOne} alt={'One way relationship'} />
                {/if}
                <span>{data.key}</span>
            </div>
        </Box>
        {#if data.relationType}
            <div>
                <p class="u-text-center">
                    <b data-private>{camelize($table.name)}</b> can contain {[
                        'oneToOne',
                        'manyToOne'
                    ].includes(data.relationType)
                        ? 'one'
                        : 'many'}
                    <b data-private>{camelize(data.key)}</b>
                </p>
                <p class="u-text-center">
                    <b data-private>{camelize(data.key)}</b>
                    can belong to {['oneToOne', 'oneToMany'].includes(data.relationType)
                        ? 'one'
                        : 'many'}
                    <b data-private>{camelize($table.name)}</b>
                </p>
            </div>
        {/if}
    </div>
    <InputSelect
        id="deleting"
        label="On deleting a row"
        bind:value={data.onDelete}
        required
        placeholder="Select a deletion method"
        options={deleteOptions} />
{/if}
