<script lang="ts">
    import { page } from '$app/state';
    import { PaginationInline } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { doc } from '../store';
    import { isRelationshipToMany } from './store';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';

    export let id: string;
    export let label: string;

    export let value: string | string[];
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;
    export let editing = false;

    const databaseId = page.params.database;

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
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection,
                [Query.startsWith('$id', search), Query.orderDesc('')]
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
        <Layout.Stack direction="row" alignContent="space-between">
            <Layout.Stack gap="xxs" direction="row" alignItems="center">
                <Typography.Text variant="m-500">{label}</Typography.Text>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                    {optionalText}
                </Typography.Text>
            </Layout.Stack>
            {#if editing || total === 0}
                <Button
                    secondary
                    on:click={() => {
                        showInput = true;
                    }}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add item
                </Button>
            {/if}
        </Layout.Stack>
        <ul class="u-flex-vertical u-gap-4 u-margin-block-start-4">
            {#if !editing && relatedList?.length}
                {#each relatedList as item, i}
                    <InputSelect {id} required bind:value={item} {options} />
                    <Button
                        extraCompact
                        ariaLabel={`Delete item ${i}`}
                        on:click={() => {
                            relatedList.splice(i, 1);
                            relatedList = relatedList;
                            value = relatedList;
                        }}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </Button>
                {/each}
            {/if}

            {#if showInput}
                <InputSelect
                    {id}
                    label="Rel"
                    required
                    placeholder={`Select ${attribute.key}`}
                    bind:value={relatedList[total]}
                    options={options?.filter((n) => !relatedList.includes(n.value))}
                    on:change={() => {
                        value = relatedList;
                        showInput = false;
                    }} />
                <Button extraCompact ariaLabel={`Hide input`} on:click={() => (showInput = false)}>
                    <span class="icon-x" aria-hidden="true"></span>
                </Button>
            {/if}
            {#if paginatedItems && editing}
                {#each paginatedItems as item, i}
                    <InputSelect {id} label="Rel" required bind:value={item} {options} />
                    <Button
                        extraCompact
                        ariaLabel={`Delete item ${i}`}
                        on:click={() => {
                            relatedList.splice(i, 1);
                            relatedList = relatedList;
                            value = relatedList;
                        }}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </Button>
                {/each}
            {/if}
        </ul>
        {#if editing}
            <div class="u-flex u-margin-block-start-32 u-main-space-between">
                <p class="text">Total results: {total}</p>
                <PaginationInline {limit} bind:offset {total} hidePages />
            </div>
        {/if}

        {#if total > 0 && !editing}
            <Button
                extraCompact
                disabled={showInput}
                on:click={() => {
                    showInput = true;
                }}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add item
            </Button>
        {/if}
    </div>
{:else}
    <InputSelect
        {id}
        {label}
        {options}
        required={attribute.required}
        placeholder={`Select ${attribute.key}`}
        bind:value={singleRel}
        on:change={() => (value = singleRel)} />
{/if}
