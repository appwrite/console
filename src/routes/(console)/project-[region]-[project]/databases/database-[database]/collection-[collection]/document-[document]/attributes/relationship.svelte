<script lang="ts">
    import { page } from '$app/stores';
    import { PaginationInline } from '$lib/components';
    import { SelectSearchItem } from '$lib/elements';
    import { Button, InputSelectSearch, Label } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { doc } from '../store';
    import { isRelationshipToMany } from './store';

    export let id: string;
    export let label: string;

    export let value: string | string[];
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;
    export let editing = false;

    const databaseId = $page.params.database;

    let documentList: Models.DocumentList<Models.Document>;
    let search: string = null;
    let displayNames = ['$id'];
    let relatedList: string[] = [];
    let singleRel: string;
    let showInput = false;
    let limit = 10;
    let offset = 0;

    onMount(async () => {
        if (value) {
            if (isRelationshipToMany(attribute)) {
                relatedList = (value as string[]).slice();
            } else {
                singleRel = value as string;
            }
        }
        documentList = await getDocuments();

        if (editing && $doc?.[attribute.key]) {
            if ($doc[attribute.key]?.length) {
                relatedList =
                    $doc[attribute.key]?.map((d: Record<string, unknown>) => {
                        return d?.$id;
                    }) ?? [];
            } else {
                singleRel = $doc[attribute.key]?.$id;
            }
        }

        displayNames = preferences.getDisplayNames()?.[attribute?.relatedCollection] ?? ['$id'];
        if (!displayNames?.includes('$id')) {
            displayNames.unshift('$id');
        }
    });

    async function getDocuments(search: string = null) {
        if (search) {
            const documents = await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.listDocuments(databaseId, attribute.relatedCollection, [
                    Query.startsWith('$id', search),
                    Query.orderDesc('')
                ]);
            return documents;
        } else {
            const documents = await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.listDocuments(databaseId, attribute.relatedCollection);
            return documents;
        }
    }

    //Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));

    $: paginatedItems = editing
        ? relatedList
              .slice()
              .reverse()
              .slice(offset, offset + limit)
        : [];
    $: total = relatedList?.length ?? 0;
    $: options =
        documentList?.documents?.map((n) => {
            const data = displayNames.filter((name) => name !== '$id').map((name) => n?.[name]);
            return {
                value: n.$id,
                label: n.$id,
                data
            };
        }) ?? [];
</script>

{#if isRelationshipToMany(attribute)}
    <div class="u-width-full-line">
        <div class="u-flex u-cross-center u-main-space-between">
            <div>
                <Label required={attribute.required} {optionalText} for={id}>
                    {label}
                </Label>
            </div>
            {#if editing || total === 0}
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
            {#if !editing && relatedList?.length}
                {#each relatedList as item, i}
                    <li class="u-flex u-gap-16">
                        <InputSelectSearch
                            {id}
                            label="Rel"
                            showLabel={false}
                            required
                            bind:search
                            bind:value={item}
                            {options}
                            let:option={o}>
                            <SelectSearchItem data={o.data}>
                                {o.label}
                            </SelectSearchItem>
                            <svelte:fragment slot="output" let:option={o}>
                                <output class="input-text is-read-only">
                                    <SelectSearchItem data={o.data}>
                                        {o.label}
                                    </SelectSearchItem>
                                </output>
                            </svelte:fragment>
                        </InputSelectSearch>
                        <Button
                            text
                            noMargin
                            ariaLabel={`Delete item ${i}`}
                            on:click={() => {
                                relatedList.splice(i, 1);
                                relatedList = relatedList;
                                value = relatedList;
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </li>
                {/each}
            {/if}

            {#if showInput}
                <li class="u-flex u-gap-16">
                    <InputSelectSearch
                        {id}
                        label="Rel"
                        showLabel={false}
                        required
                        placeholder={`Select ${attribute.key}`}
                        bind:search
                        bind:value={relatedList[total]}
                        options={options?.filter((n) => !relatedList.includes(n.value))}
                        on:select={() => {
                            value = relatedList;
                            showInput = false;
                        }}
                        let:option={o}>
                        <SelectSearchItem data={o.data}>
                            {o.label}
                        </SelectSearchItem>
                        <svelte:fragment slot="output" let:option={o}>
                            <output class="input-text is-read-only">
                                <SelectSearchItem data={o.data}>
                                    {o.label}
                                </SelectSearchItem>
                            </output>
                        </svelte:fragment>
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
            {#if paginatedItems && editing}
                {#each paginatedItems as item, i}
                    <li class="u-flex u-gap-16">
                        <InputSelectSearch
                            {id}
                            label="Rel"
                            showLabel={false}
                            required
                            bind:search
                            bind:value={item}
                            {options}
                            let:option={o}>
                            <SelectSearchItem data={o.data}>
                                {o.label}
                            </SelectSearchItem>
                            <svelte:fragment slot="output" let:option={o}>
                                <output class="input-text is-read-only">
                                    <SelectSearchItem data={o.data}>
                                        {o.label}
                                    </SelectSearchItem>
                                </output>
                            </svelte:fragment>
                        </InputSelectSearch>
                        <Button
                            text
                            noMargin
                            ariaLabel={`Delete item ${i}`}
                            on:click={() => {
                                relatedList.splice(i, 1);
                                relatedList = relatedList;
                                value = relatedList;
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </li>
                {/each}
            {/if}
        </ul>
        {#if editing}
            <div class="u-flex u-margin-block-start-32 u-main-space-between">
                <p class="text">Total results: {total}</p>
                <PaginationInline {limit} bind:offset sum={total} hidePages />
            </div>
        {/if}
        {#if total > 0 && !editing}
            <Button
                text
                noMargin
                disabled={showInput}
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
        interactiveOutput
        bind:search
        bind:value={singleRel}
        {options}
        let:option={o}
        on:reset={() => (value = null)}
        on:select={() => (value = singleRel)}>
        <SelectSearchItem data={o.data}>
            {o.label}
        </SelectSearchItem>
        <svelte:fragment slot="output" let:option={o}>
            <output class="input-text">
                <SelectSearchItem data={o.data}>
                    {o.label}
                </SelectSearchItem>
            </output>
        </svelte:fragment>
    </InputSelectSearch>
{/if}
