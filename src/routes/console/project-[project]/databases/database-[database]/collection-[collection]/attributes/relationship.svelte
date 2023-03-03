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
</script>

<script lang="ts">
    import { InputText, InputSelect, Button, InputSelectSearch } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Box, LabelCard } from '$lib/components';
    import { collection } from '../store';

    export let selectedAttribute: Models.AttributeString;
    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false
    };

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
    let search: string = null;
    let collections: Models.Collection[] = [];
    let isOneWay = true;

    onMount(async () => {
        const collectionList = await getCollections();
        collections = collectionList.collections.filter((n) => n.$id !== $collection.$id);
        data.relation = 'one';
    });

    async function getCollections() {
        if (search) {
            const collections = await sdkForProject.databases.listCollections(databaseId, [
                Query.startsWith(search),
                Query.orderDesc('$createdAt')
            ]);
            return collections;
        } else {
            const collections = await sdkForProject.databases.listCollections(databaseId);
            return collections;
        }
    }

    $: if (search) {
        getCollections();
    }

    $: if (selectedAttribute) {
        ({
            required: data.required,
            array: data.array,
            size: data.size,
            default: data.default
        } = selectedAttribute);
    }
    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<ul class="grid-box" style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem;">
    <li>
        <LabelCard name="relationship" group="relationship" value="one">
            <svelte:fragment slot="title">One-way relationship</svelte:fragment>
            One Relation attribute within this collection
        </LabelCard>
    </li>
    <li>
        <LabelCard name="relationship" group="relationship" value="two">
            <svelte:fragment slot="title">Two-way relationship</svelte:fragment>
            One Relation attribute within this collection and another within the related collection
        </LabelCard>
    </li>
</ul>

<Button secondary on:click={() => (isOneWay = true)} disabled={isOneWay}>One</Button>
<Button secondary on:click={() => (isOneWay = false)} disabled={!isOneWay}>Two</Button>

<InputSelectSearch
    id="related"
    label="Related Collection"
    bind:search
    bind:value={data.related}
    required
    placeholder="Select a collection"
    options={collections?.map((n) => ({ value: n.$id, label: n.name }))} />
<InputSelect
    id="related"
    label="Related Collection"
    bind:value={data.related}
    required
    placeholder="Select a collection"
    options={collections?.map((n) => ({ value: n.$id, label: n.name }))} />
{#if data?.related}
    {@const selectedCol = collections.find((n) => n.$id === data.related)}
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
    {#if !isOneWay}
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
        options={isOneWay ? oneWay : twoWay} />

    <Box>
        {$collection.name} -> {selectedCol.name}
    </Box>
    <p>
        <b> {$collection.name}</b> has {data.relation === 'one' ? 'one' : 'many'}
        <b>{selectedCol.name}</b>
    </p>
{/if}
