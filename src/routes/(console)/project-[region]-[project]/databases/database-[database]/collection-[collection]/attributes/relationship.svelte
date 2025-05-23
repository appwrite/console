<script context="module" lang="ts">
    import { page } from '$app/state';
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

        await sdk
            .forProject(page.params.region, page.params.project)
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

        await sdk
            .forProject(page.params.region, page.params.project)
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
    import { InputText, InputSelect } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { Box } from '$lib/components';
    import { collection } from '../store';
    import arrowOne from './arrow-one.svg';
    import arrowTwo from './arrow-two.svg';
    import { camelize } from '$lib/helpers/string';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Card, Layout, Input } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight, IconSwitchHorizontal } from '@appwrite.io/pink-icons-svelte';

    // Props
    export let data: Models.AttributeRelationship;
    export let editing = false;

    // Constants
    const databaseId = page.params.database;
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
    let collectionList: Models.CollectionList;
    let way = 'one';

    // Lifecycle hooks
    async function getCollections() {
        const queries = [Query.limit(100)];
        return sdk
            .forProject(page.params.region, page.params.project)
            .databases.listCollections(databaseId, queries);
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

<Layout.Stack direction="row" wrap="wrap">
    <Card.Selector
        title="One-way relationship"
        bind:group={way}
        name="one"
        value="one"
        icon={IconArrowSmRight}>
        <p>One Relation attribute within this collection</p>
    </Card.Selector>
    <Card.Selector
        title="Two-way relationship"
        bind:group={way}
        name="two"
        value="two"
        icon={IconSwitchHorizontal}>
        <p>
            One Relation attribute within this collection and another within the related collection
        </p>
    </Card.Selector>
</Layout.Stack>

<Input.ComboBox
    required
    id="related"
    label="Related collection"
    placeholder="Select a collection"
    isSearchable
    bind:value={data.relatedCollection}
    on:change={updateKeyName}
    options={collections?.map((n) => ({ value: n.$id, label: `${n.name} (${n.$id})` })) ?? []} />
{#if data?.relatedCollection}
    <InputText
        id="key"
        label="Attribute key"
        placeholder="Enter key"
        bind:value={data.key}
        autofocus
        helper="Allowed characters: a-z, A-Z, 0-9, -, ."
        required />
    {#if way === 'two'}
        <InputText
            id="keyRelated"
            label="Attribute key (related collection)"
            placeholder="Enter key"
            bind:value={data.twoWayKey}
            required
            helper="Allowed characters: a-z, A-Z, 0-9, -, . Once created, attribute key cannot be
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
