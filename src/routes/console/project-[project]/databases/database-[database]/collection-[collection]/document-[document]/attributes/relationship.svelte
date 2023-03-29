<script lang="ts">
    import { page } from '$app/stores';
    import { Button, InputSelectSearch } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { teamPrefs } from '$lib/stores/team';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;

    const databaseId = $page.params.database;

    let documentList: Models.DocumentList<Models.Document>;
    let search: string = null;
    let displayNames = ['$id'];
    let addRelationship = false;

    onMount(async () => {
        teamPrefs.load($organization.$id);
        documentList = await getDocuments();

        displayNames = $teamPrefs?.displayNames?.[attribute?.relatedCollection] ?? ['$id'];
        if (!displayNames?.includes('$id')) {
            displayNames.unshift('$id');
        }
    });

    async function getDocuments(search: string = null) {
        if (search) {
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection,
                [Query.search(displayNames[0], search), Query.orderDesc('$createdAt')]
            );
            return documents;
        } else {
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection
            );
            return documents;
        }
    }

    function isArray() {
        if (attribute.twoWay) {
            return attribute.relationType !== 'oneToOne';
        } else {
            return attribute.relationType === 'oneToMany';
        }
    }
    // Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));
</script>

{#if isArray()}
    <div class="u-width-full-line u-max-width-600">
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
                        options={documentList?.documents?.map((n) => ({
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
                        <button
                            class="button is-text u-padding-inline-0"
                            aria-label="delete item 1">
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
    </div>
{:else}
    <InputSelectSearch
        {id}
        {label}
        {optionalText}
        required={attribute.required}
        name="documents"
        placeholder={`Select ${attribute.key}`}
        bind:search
        bind:value
        options={documentList?.documents?.map((n) => ({
            value: n.$id,
            label: n?.[displayNames[0]]
        })) ?? []} />
{/if}
