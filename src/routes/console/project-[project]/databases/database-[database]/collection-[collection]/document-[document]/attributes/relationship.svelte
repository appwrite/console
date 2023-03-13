<script lang="ts">
    import { Button, InputSelectSearch } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { onMount } from 'svelte';

    export let id: string;
    export let label: string;
    export let value: number;
    export let attribute: Models.AttributeInteger;
    export let optionalText: string | undefined = undefined;

    let addRelationship = false;
    let search: string = null;
    let collectionList: Models.CollectionList;

    onMount(async () => {
        collectionList = await getCollections();
    });

    async function getCollections(search: string = null) {
        if (search) {
            const collections = await sdkForProject.databases.listCollections(
                attribute.related,
                [Query.orderDesc('$createdAt')],
                search
            );
            return collections;
        } else {
            const collections = await sdkForProject.databases.listCollections(attribute.related);
            return collections;
        }
    }
    // Reactive statements
    $: getCollections(search).then((res) => (collectionList = res));
</script>

{#if attribute.direction === 'one'}
    <InputSelectSearch
        {id}
        {label}
        {optionalText}
        required={attribute.required}
        bind:value
        options={collectionList?.collections?.map((n) => ({ value: n.$id, label: n.name })) ??
            []} />
{:else if attribute.direction === 'many'}
    <div class="u-width-full-line u-max-width-600" />

    <div class="u-flex u-cross-baseline u-gap-16">
        <div class="u-flex u-cross-baseline u-gap-8">
            <label class="label" for="relationship">{label}</label>
            <span class="optional u-x-small">Relation</span>
        </div>
        <button
            on:click|preventDefault={() => {
                addRelationship = true;
            }}
            class="button is-text u-padding-inline-0 u-margin-inline-start-auto"
            type="button">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add item</span>
        </button>

        <ul class="u-flex-vertical u-gap-4 u-margin-block-start-4">
            {#if addRelationship === false}
                <InputSelectSearch
                    {id}
                    {label}
                    {optionalText}
                    required
                    bind:value
                    options={collectionList?.collections?.map((n) => ({
                        value: n.$id,
                        label: n.name
                    })) ?? []} />
            {/if}
            {#each attribute?.relationships as relationship}
                <li class="u-flex u-gap-16">
                    <output class="input-text is-read-only">
                        <div class="u-flex u-cross-baseline u-gap-12">
                            <span
                                class="u-flex-basis-140 u-flex-shrink-0 u-text-start u-trim-start u-x-small u-color-text-gray">
                                {realationship.label}
                            </span>
                            <span class="u-flex-1 u-trim-1">
                                {#each relationship.data as info}
                                    {info}
                                {/each}
                            </span>
                        </div>
                    </output>
                    <button class="button is-text u-padding-inline-0" aria-label="delete item 1">
                        <span class="icon-x" aria-hidden="true" />
                    </button>
                </li>
            {/each}
        </ul>

        <div class="u-flex u-cross-baseline u-gap-16 u-margin-block-start-8">
            <p class="u-small">Total results: {attribute?.relationships?.length}</p>

            <nav class="pagination u-margin-inline-start-auto" style="--button-size: 2.5rem;">
                <Button text disabled noMargin ariaLabel="prev page">
                    <span class="icon-cheveron-left" aria-hidden="true" />
                    <span class="text">Prev</span>
                </Button>

                <Button text disabled noMargin ariaLabel="next page">
                    <span class="text">Next</span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            </nav>
        </div>
    </div>
{/if}
