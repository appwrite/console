<script lang="ts">
    import { page } from '$app/stores';
    import { SelectSearchItem } from '$lib/elements';
    import { Button, InputSelectSearch, Label } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { teamPrefs } from '$lib/stores/team';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    export let id: string;
    export let label: string;
    export let value: string | string[];
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;

    const databaseId = $page.params.database;

    let documentList: Models.DocumentList<Models.Document>;
    let search: string = null;
    let displayNames = ['$id'];
    let relatedList = [];
    let showInput = false;

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
            const query = displayNames.map((name) => Query.search(name, search));
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection,
                [...query, Query.orderDesc('$createdAt')]
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

    $: isArray = !(
        attribute?.relationType === 'oneToOne' || attribute?.relationType === 'manyToOne'
    );

    // Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));

    $: if (isArray) value = relatedList.map((doc) => doc.label);
</script>

{#if isArray}
    <div class="u-width-full-line">
        <div class="u-flex u-cross-center u-main-space-between">
            <div>
                <Label required={attribute.required} {optionalText} for={id}>
                    {label}
                </Label>
            </div>
            {#if relatedList.length === 0}
                <Button
                    text
                    noMargin
                    on:click={() => {
                        showInput = true;
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add item</span>
                </Button>
            {/if}
        </div>
        <ul class="u-flex-vertical u-gap-4 u-margin-block-start-4">
            {#each relatedList as doc, i}
                <li class="u-flex u-gap-16">
                    <output class="input-text is-read-only">
                        <div class="u-flex u-cross-baseline u-gap-12">
                            <SelectSearchItem data={doc.data}>
                                {doc.label}
                            </SelectSearchItem>
                        </div>
                    </output>
                    <Button
                        text
                        noMargin
                        ariaLabel={`Delete item ${i}`}
                        on:click={() => {
                            relatedList.splice(i, 1);
                            relatedList = relatedList;
                        }}>
                        <span class="icon-x" aria-hidden="true" />
                    </Button>
                </li>
            {/each}

            {#if showInput}
                <li class="u-flex u-gap-16">
                    <InputSelectSearch
                        {id}
                        label="Rel"
                        showLabel={false}
                        required
                        bind:search
                        bind:value={relatedList[relatedList.length]}
                        options={documentList?.documents?.map((n) => {
                            const data = displayNames
                                .filter((name) => name !== '$id')
                                .map((name) => n?.[name]);
                            return {
                                value: { label: n.$id, data },
                                label: n.$id,
                                data
                            };
                        }) ?? []}
                        let:option={o}>
                        <SelectSearchItem data={o.data}>
                            {o.label}
                        </SelectSearchItem>
                    </InputSelectSearch>
                    <Button
                        text
                        noMargin
                        ariaLabel={`Hide input`}
                        on:click={() => (showInput = false)}>
                        <span class="icon-x" aria-hidden="true" />
                    </Button>
                </li>
            {/if}
        </ul>

        {#if relatedList.length > 0 && !showInput}
            <Button
                text
                noMargin
                on:click={() => {
                    showInput = true;
                }}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add item</span>
            </Button>
        {/if}
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
        options={documentList?.documents?.map((n) => {
            const data = displayNames.filter((name) => name !== '$id').map((name) => n?.[name]);
            return {
                value: n.$id,
                label: n.$id,
                data
            };
        }) ?? []}
        let:option={o}>
        <SelectSearchItem data={o.data}>
            {o.label}
        </SelectSearchItem>
    </InputSelectSearch>
{/if}
