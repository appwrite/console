<script context="module" lang="ts">
    import { Query, type Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitRelationship(
        databaseId: string,
        collectionId: string,
        _: string,
        data: Partial<Models.AttributeRelationship>
    ) {
        await sdk.forProject.databases.createRelationshipAttribute(
            databaseId,
            collectionId,
            data.relatedCollection,
            data.relationType,
            data.twoWay,
            data.key,
            data.twoWayKey,
            data.onDelete
        );
    }

    export async function updateRelationship(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeRelationship>
    ) {
        await sdk.forProject.databases.updateRelationshipAttribute(
            databaseId,
            collectionId,
            data.key,
            data.twoWay,
            data.onDelete
        );
    }
</script>

<script lang="ts">
    import { InputText, InputSelect, InputSelectSearch } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { LabelCard } from '$lib/components';
    import { collection } from '../store';
    import arrowOne from './arrow-one.svg';
    import arrowTwo from './arrow-two.svg';
    import { camelize } from '$lib/helpers/string';
    import { SelectSearchItem } from '$lib/elements';

    // Props
    export let data: Partial<Models.AttributeRelationship>;
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
        { value: 'setNull', label: 'Null' },
        { value: 'cascade', label: 'Cascade' },
        { value: 'restrict', label: 'Restrict' }
    ];

    // Variables
    let search: string = null;
    let collectionList: Models.CollectionList;
    let way = 'one';

    // Lifecycle hooks
    async function getCollections(search: string = null) {
        if (search) {
            const collections = await sdk.forProject.databases.listCollections(
                databaseId,
                [Query.orderDesc('$createdAt')],
                search
            );
            return collections;
        } else {
            const collections = await sdk.forProject.databases.listCollections(databaseId);
            return collections;
        }
    }

    onMount(async () => {
        collectionList = await getCollections();

        if (editing) {
            way = data.twoWay ? 'two' : 'one';
            search = data.relatedCollection;
        }
    });

    // Reactive statements

    $: getCollections(search).then((res) => (collectionList = res));
    $: collections = collectionList?.collections?.filter((n) => n.$id !== $collection.$id) ?? [];

    $: if (data?.relatedCollection && !data.key) {
        const collection = collectionList.collections.find((n) => n.$id === data.relatedCollection);
        data.key = camelize(collection.name);
    }
    $: if (way === 'two' && !data.twoWayKey) {
        data.twoWayKey = camelize($collection.name);
    }

    $: if (way === 'two') {
        data.twoWay = true;
    } else {
        data.twoWay = false;
    }
</script>

<li>
    <ul
        class="grid-box"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 0.5rem;">
        <li>
            <LabelCard name="relationship" bind:group={way} value="one" icon="arrow-sm-right">
                <svelte:fragment slot="title">One-way relationship</svelte:fragment>
                One Relation attribute within this collection
            </LabelCard>
        </li>
        <li>
            <LabelCard name="relationship" bind:group={way} value="two" icon="switch-horizontal">
                <svelte:fragment slot="title">Two-way relationship</svelte:fragment>
                One Relation attribute within this collection and another within the related collection
            </LabelCard>
        </li>
    </ul>
</li>

<InputSelectSearch
    id="related"
    label="Related Collection"
    name="collections"
    bind:search
    bind:value={data.relatedCollection}
    required
    placeholder="Select a collection"
    disabled={editing}
    options={collections?.map((n) => ({ value: n.$id, label: n.$id, data: [n.name] })) ?? []}
    let:option={o}>
    <SelectSearchItem data={o.data}>
        {o.label}
    </SelectSearchItem>
</InputSelectSearch>

{#if data?.relatedCollection}
    <div>
        <InputText
            id="key"
            label="Attribute Key"
            placeholder="Enter Key"
            bind:value={data.key}
            autofocus
            disabled={editing}
            required />

        <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
            <span
                class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                aria-hidden="true" />
            <span class="text u-line-height-1-5">
                Allowed characters: alphanumeric, hyphen, non-leading underscore, period
            </span>
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
                disabled={editing} />

            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                <span
                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5">
                    Allowed characters: alphanumeric, hyphen, non-leading underscore, period
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

    <div class="box">
        <div class="u-flex u-align u-cross-center u-main-center u-gap-32">
            <span>{camelize($collection.name)}</span>
            {#if way === 'one'}
                <img src={arrowOne} alt={'One way realationship'} />
            {:else}
                <img src={arrowTwo} alt={'Two way relationship'} />
            {/if}
            <span>{data.key}</span>
        </div>
    </div>
    <p class="u-text-center">
        <b> {camelize($collection.name)}</b> has {way === 'one' ? 'one' : 'many'}
        <b>{data.key}</b>
    </p>

    <InputSelect
        id="deleting"
        label="On deleting a document"
        bind:value={data.onDelete}
        required
        placeholder="Select a deletion method"
        options={deleteOptions} />
{/if}
