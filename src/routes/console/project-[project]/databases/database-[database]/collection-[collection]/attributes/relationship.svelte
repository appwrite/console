<script context="module" lang="ts">
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitRelationship(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdkForProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            data.size,
            data.required,
            data.default ? (data.default as string) : undefined,
            data.array
        );
    }

    export async function updateRelationship(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdkForProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            data.key,
            data.size,
            data.required,
            data.default ? (data.default as string) : undefined,
            data.array
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

    // Props
    export let selectedAttribute: Models.AttributeString;

    type Data = Partial<Models.AttributeString> & {
        relation: 'one' | 'many';
        related?: string | number | boolean;
        keyRelated?: string;
        del?: string | number | boolean;
    };

    export let data: Data = {
        required: false,
        size: 0,
        default: null,
        array: false,
        relation: 'one'
    };

    // Constants
    const databaseId = $page.params.database;
    const oneWay = [
        { value: 'one', label: 'One to one' },
        { value: 'many', label: 'One to many' }
    ];
    const twoWay = [
        { value: 'one', label: 'One to one' },
        { value: 'many', label: 'One to many' },
        { value: 'manyOne', label: 'Many to one' },
        { value: 'manyMany', label: 'Many to many' }
    ];

    const deleteOptions = [
        { value: 'cascade', label: 'Cascade' },
        { value: 'null', label: 'Null' },
        { value: 'restrict', label: 'Restrict' }
    ];

    // Variables
    let search: string = null;
    let collectionList: Models.CollectionList;
    let way = 'one';

    // Lifecycle hooks
    async function getCollections(search: string = null) {
        if (search) {
            const collections = await sdkForProject.databases.listCollections(
                databaseId,
                [Query.orderDesc('$createdAt')],
                search
            );
            return collections;
        } else {
            const collections = await sdkForProject.databases.listCollections(databaseId);
            return collections;
        }
    }

    onMount(async () => {
        collectionList = await getCollections();
    });

    // Reactive statements
    $: getCollections(search).then((res) => (collectionList = res));
    $: collections = collectionList?.collections?.filter((n) => n.$id !== $collection.$id) ?? [];

    $: if (selectedAttribute) {
        data = {
            ...data,
            required: selectedAttribute.required,
            array: selectedAttribute.array,
            size: selectedAttribute.size,
            default: selectedAttribute.default
        };
    }

    $: if (data.required || data.array) {
        data.default = null;
    }

    $: console.log(data.related);

    $: if (data.related && !data.key) {
        const collection = collectionList.collections.find((n) => n.$id === data.related);
        // data key = data related in snake case
        data.key = collection.name.replace(/\s+/g, '_').toLowerCase();
    }
</script>

<li>
    <ul class="grid-box" style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem;">
        <li>
            <LabelCard name="relationship" bind:group={way} value="one">
                <svelte:fragment slot="title">One-way relationship</svelte:fragment>
                One Relation attribute within this collection
            </LabelCard>
        </li>
        <li>
            <LabelCard name="relationship" bind:group={way} value="two">
                <svelte:fragment slot="title">Two-way relationship</svelte:fragment>
                One Relation attribute within this collection and another within the related collection
            </LabelCard>
        </li>
    </ul>
</li>

<InputSelectSearch
    id="related"
    label="Related Collection"
    bind:search
    bind:value={data.related}
    required
    placeholder="Select a collection"
    options={collectionList?.collections?.map((n) => ({ value: n.$id, label: n.name })) ?? []} />

{#if data?.related}
    {@const selectedCol = collections?.find((n) => n.$id === data.related)}
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
            <span class="text u-line-height-1-5">
                Allowed characters: alphanumeric, hyphen, non-leading underscore, period
            </span>
        </div>
    </div>
    {#if way === 'two'}
        <div>
            <InputText
                id="keyRelated"
                label="Attribute Key "
                placeholder="Enter Key"
                bind:value={data.keyRelated}
                autofocus
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
    {/if}

    <InputSelect
        id="relationship"
        label="Reraltion"
        bind:value={data.relation}
        required
        placeholder="Select a relation"
        options={way === 'one' ? oneWay : twoWay} />

    <div class="box">
        <div class="u-flex u-align u-cross-center u-main-center	u-gap-32 ">
            <span>{$collection.name}</span>
            {#if way === 'one'}
                <img src={arrowOne} alt={'One way realationship'} />
            {:else}
                <img src={arrowTwo} alt={'Two way relationship'} />
            {/if}
            <span>{selectedCol?.name}</span>
        </div>
    </div>
    <p class="u-text-center	">
        <b> {$collection.name}</b> has {data.relation === 'one' ? 'one' : 'many'}
        <b>{selectedCol?.name}</b>
    </p>

    <InputSelect
        id="deleting"
        label="On deleting a document"
        bind:value={data.del}
        required
        placeholder="Select a deletion method"
        options={deleteOptions} />
{/if}
