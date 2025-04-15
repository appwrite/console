<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import { ID, type Models, Query, RelationMutate, RelationshipType } from '@appwrite.io/console';

    export async function submitRelationship(
        databaseId: string,
        collectionId: string,
        _key: string,
        data: Partial<Models.AttributeRelationship>
    ) {
        if (!isValueOfStringEnum(RelationshipType, data.relationType)) {
            throw new Error(`Invalid relationship type: ${data.relationType}`);
        }
        if (!isValueOfStringEnum(RelationMutate, data.onDelete)) {
            throw new Error(`Invalid on delete: ${data.onDelete}`);
        }

        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.createRelationshipAttribute(
                databaseId,
                collectionId,
                data.relatedCollection,
                data.relationType,
                data.twoWay,
                data.key,
                data.twoWayKey ?? ID.unique(),
                data.onDelete
            );
    }

    export async function updateRelationship(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeRelationship>,
        originalKey?: string
    ) {
        if (!isValueOfStringEnum(RelationMutate, data.onDelete)) {
            throw new Error(`Invalid on delete: ${data.onDelete}`);
        }

        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.updateRelationshipAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.onDelete,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { InputText, InputSelect, InputSelectSearch } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { Box, LabelCard } from '$lib/components';
    import { collection } from '../store';
    import arrowOne from './arrow-one.svg';
    import arrowTwo from './arrow-two.svg';
    import { camelize } from '$lib/helpers/string';
    import { SelectSearchItem } from '$lib/elements';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    // Props
    export let data: Models.AttributeRelationship;
    export let editing = false;

    // Constants
    const databaseId = $page.params.database;
    const relationshipType = [
        { value: 'oneToOne', label: 'One to one' },
        { value: 'oneToMany', label: 'One to many' },
        { value: 'manyToOne', label: 'Many to one' },
        { value: 'manyToMany', label: 'Many to many' }
    ];

    const deleteOptions = [
        { value: 'setNull', label: 'Set NULL - set document ID as NULL in all related documents' },
        { value: 'cascade', label: 'Cascade - delete all related documents' },
        { value: 'restrict', label: 'Restrict - document can not be deleted' }
    ];

    // Variables
    let search: string = null;
    let collectionList: Models.CollectionList;
    let way = 'one';

    // Lifecycle hooks
    async function getCollections(search: string = null) {
        const queries = search ? [Query.orderDesc('')] : [Query.limit(100)];
        return sdk
            .forProject($page.params.region, $page.params.project)
            .databases.listCollections(databaseId, queries, search);
    }

    function updateKeyName() {
        if (!editing) {
            const collection = collectionList.collections.find(
                (n) => n.$id === data.relatedCollection
            );
            data.key = camelize(collection.name);
        }
    }

    onMount(async () => {
        collectionList = await getCollections();
    });

    // Reactive statements
    $: getCollections(search).then((res) => (collectionList = res));
    $: collections = collectionList?.collections?.filter((n) => n.$id !== $collection.$id) ?? [];

    $: if (editing) {
        way = data.twoWay ? 'two' : 'one';
    } else {
        if (way === 'two') {
            data.twoWay = true;
            if (!data.twoWayKey) {
                data.twoWayKey = camelize($collection.name);
            }
        } else {
            data.twoWay = false;
        }
    }
</script>

<li>
    <ul
        class="grid-box"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 0.5rem;">
        <li>
            <LabelCard
                name="relationship"
                bind:group={way}
                value="one"
                icon="arrow-sm-right"
                disabled={editing}>
                <svelte:fragment slot="title">One-way relationship</svelte:fragment>
                One Relation attribute within this collection
            </LabelCard>
        </li>
        <li>
            <LabelCard
                name="relationship"
                bind:group={way}
                value="two"
                icon="switch-horizontal"
                disabled={editing}>
                <svelte:fragment slot="title">Two-way relationship</svelte:fragment>
                One Relation attribute within this collection and another within the related collection
            </LabelCard>
        </li>
    </ul>
</li>

<div>
    <InputSelectSearch
        id="related"
        label="Related Collection"
        name="collections"
        bind:search
        bind:value={data.relatedCollection}
        required
        interactiveOutput={!editing}
        placeholder="Select a collection"
        disabled={editing}
        options={collections?.map((n) => ({ value: n.$id, label: n.$id, data: [n.name] })) ?? []}
        on:select={updateKeyName}
        let:option={o}>
        <SelectSearchItem data={o.data}>
            {o.label}
        </SelectSearchItem>
        <svelte:fragment slot="output" let:option={o}>
            <output class="input-text" class:is-read-only={editing}>
                <SelectSearchItem data={o.data}>
                    {o.label}
                </SelectSearchItem>
            </output>
        </svelte:fragment>
    </InputSelectSearch>
</div>

{#if data?.relatedCollection}
    <div>
        <InputText
            id="key"
            label="Attribute Key"
            placeholder="Enter Key"
            bind:value={data.key}
            autofocus
            required />

        <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
            <span
                class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                aria-hidden="true" />
            <span class="text u-line-height-1-5">Allowed characters: a-z, A-Z, 0-9, -, .</span>
        </div>
    </div>
    {#if way === 'two'}
        <div>
            <InputText
                id="keyRelated"
                label="Attribute Key (related collection)"
                placeholder="Enter Key"
                bind:value={data.twoWayKey}
                required
                readonly={editing} />

            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                <span
                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5">
                    Allowed characters: a-z, A-Z, 0-9, -, . Once created, attribute key cannot be
                    adjusted to maintain data integrity.
                </span>
            </div>
        </div>
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
                <span data-private>{camelize($collection.name)}</span>
                {#if data.twoWay}
                    <img src={arrowTwo} alt={'Two way relationship'} />
                {:else}
                    <img src={arrowOne} alt={'One way realationship'} />
                {/if}
                <span>{data.key}</span>
            </div>
        </Box>
        {#if data.relationType}
            <div>
                <p class="u-text-center">
                    <b data-private>{camelize($collection.name)}</b> can contain {[
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
                    <b data-private>{camelize($collection.name)}</b>
                </p>
            </div>
        {/if}
    </div>
    <InputSelect
        id="deleting"
        label="On deleting a document"
        bind:value={data.onDelete}
        required
        placeholder="Select a deletion method"
        options={deleteOptions} />
{/if}
