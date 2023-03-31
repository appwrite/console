<script lang="ts">
    import { page } from '$app/stores';
    import { Paginator } from '$lib/components';
    import { SelectSearchItem } from '$lib/elements';
    import { Button, InputSelectSearch, Label } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { teamPrefs } from '$lib/stores/team';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { doc } from '../store';

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
    let relatedList: string[] | { label: string; data: Record<string, unknown> }[] = [];
    let showInput = false;

    onMount(async () => {
        teamPrefs.load($organization.$id);
        documentList = await getDocuments();

        if (editing && $doc?.[attribute.key] && $doc[attribute.key]?.length) {
            relatedList =
                $doc[attribute.key]?.map((d: Record<string, unknown>) => {
                    return d?.$id;
                }) ?? [];
        }

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
                [Query.search('$id', search), Query.orderDesc('$createdAt')]
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

    function isArrayFunc() {
        const { side, relationType } = attribute || {};
        if (side === 'parent') {
            return !['oneToOne', 'manyToOne'].includes(relationType);
        } else {
            return !['oneToOne', 'oneToMany'].includes(relationType);
        }
    }

    $: isArray = isArrayFunc();

    // Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));

    $: if (isArray) value = relatedList;
</script>

{#if editing && isArray && relatedList.length > 0}
    <Paginator items={relatedList} limit={5} let:paginatedItems>
        <div class="u-flex u-cross-center u-main-space-between">
            <div>
                <Label required={attribute.required} {optionalText} for={id}>
                    {label}
                </Label>
            </div>
            <Button
                text
                noMargin
                on:click={() => {
                    console.log('test');
                    showInput = true;
                    console.log(showInput);
                }}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add item</span>
            </Button>
        </div>
        <ul class="u-flex-vertical u-gap-4 u-margin-block-start-4">
            {#if showInput}
                <li class="u-flex u-gap-16">
                    <InputSelectSearch
                        {id}
                        label="Rel"
                        showLabel={false}
                        required
                        customOutput
                        placeholder={`Select ${attribute.key}`}
                        bind:search
                        bind:value={relatedList[relatedList.length]}
                        options={documentList?.documents?.map((n) => {
                            const data = displayNames
                                .filter((name) => name !== '$id')
                                .map((name) => n?.[name]);
                            return {
                                value: n.$id,
                                label: n.$id,
                                data
                            };
                        }) ?? []}
                        on:select={() => {
                            showInput = false;
                        }}
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
            {#if paginatedItems?.length}
                {#each paginatedItems as doc, i}
                    <li class="u-flex u-gap-16">
                        <InputSelectSearch
                            {id}
                            label="Rel"
                            showLabel={false}
                            required
                            customOutput
                            bind:search
                            bind:value={doc}
                            options={documentList?.documents?.map((n) => {
                                const data = displayNames
                                    .filter((name) => name !== '$id')
                                    .map((name) => n?.[name]);
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
            {/if}
        </ul>
    </Paginator>
{:else if isArray}
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
                    <InputSelectSearch
                        {id}
                        label="Rel"
                        showLabel={false}
                        required
                        customOutput
                        bind:search
                        bind:value={doc}
                        options={documentList?.documents?.map((n) => {
                            const data = displayNames
                                .filter((name) => name !== '$id')
                                .map((name) => n?.[name]);
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
                        customOutput
                        placeholder={`Select ${attribute.key}`}
                        bind:search
                        bind:value={relatedList[relatedList.length]}
                        options={documentList?.documents?.map((n) => {
                            const data = displayNames
                                .filter((name) => name !== '$id')
                                .map((name) => n?.[name]);
                            return {
                                value: n.$id,
                                label: n.$id,
                                data
                            };
                        }) ?? []}
                        on:select={() => {
                            showInput = false;
                        }}
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

        {#if relatedList.length > 0}
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
