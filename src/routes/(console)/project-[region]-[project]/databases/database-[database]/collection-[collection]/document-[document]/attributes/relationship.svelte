<script lang="ts">
    import { page } from '$app/state';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { doc } from '../store';
    import { isRelationshipToMany } from './store';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;

    export let editing = false;
    export let value: string | string[];
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;

    const databaseId = page.params.database;

    let documentList: Models.DocumentList<Models.Document>;
    let search: string = null;
    let displayNames = ['$id'];
    let relatedList: string[] = [];
    let singleRel: string;
    let showInput = false;
    let newItemValue: string = '';
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
        const queries = search ? [Query.startsWith('$id', search), Query.orderDesc('')] : [];
        return await sdk
            .forProject(page.params.region, page.params.project)
            .databases.listDocuments(databaseId, attribute.relatedCollection, queries);
    }

    function getAvailableOptions(excludeIndex?: number) {
        return options?.filter((option) => {
            const otherItems =
                excludeIndex !== undefined
                    ? relatedList.filter((_, idx) => idx !== excludeIndex)
                    : relatedList;
            return !otherItems.includes(option.value);
        });
    }

    function updateRelatedList() {
        relatedList = relatedList;
        value = relatedList;
    }

    function removeItem(index: number) {
        if (relatedList.length === 1) {
            relatedList[index] = '';
        } else {
            relatedList.splice(index, 1);
        }
        updateRelatedList();
    }

    function addNewItem() {
        if (newItemValue) {
            relatedList = [...relatedList, newItemValue];
            value = relatedList;
            newItemValue = '';
            showInput = false;
        }
    }

    function cancelAddItem() {
        newItemValue = '';
        showInput = false;
    }

    //Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));

    $: paginatedItems = editing
        ? relatedList
              .slice()
              .reverse()
              .slice(offset, offset + limit)
        : [];

    $: totalCount = relatedList?.length ?? 0;

    $: options =
        documentList?.documents?.map((document) => {
            const names = displayNames.filter((name) => name !== '$id');
            const values = names
                .map((name) => document?.[name])
                // always supposed to be a string but just being a bit safe here
                .filter((value) => value != null && typeof value === 'string' && value !== '');

            const displayValues = !editing
                ? values
                : // on non edit routes like create, there's enough space!
                  values.map((value) => (value.length > 5 ? value.slice(0, 5) + '...' : value));

            const label = !values.length
                ? document.$id
                : // values are in `$id (a | b)` format
                  // previously used to have a `$id a | b`.
                  `${document.$id} (${displayValues.join(' | ')})`;

            return {
                label,
                value: document.$id,
                data: names.map((name) => document?.[name])
            };
        }) ?? [];

    $: hasItems = totalCount > 0;
    $: showTopAddButton = !editing && totalCount === 0 && !showInput;
    $: showBottomAddButton =
        (!editing && hasItems && !showInput) ||
        (editing && hasItems && relatedList.every((item) => item) && !showInput);
    $: showEmptyInput = editing && totalCount === 0 && !showInput;
</script>

{#if isRelationshipToMany(attribute)}
    <Layout.Stack gap="xxl">
        <Layout.Stack gap="m">
            <Layout.Stack direction="row" alignContent="space-between">
                <Layout.Stack gap="xxs" direction="row" alignItems="center">
                    <Typography.Text variant="m-500">{label}</Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        {optionalText}
                    </Typography.Text>
                </Layout.Stack>

                {#if showTopAddButton}
                    <Button secondary on:click={() => (showInput = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add item
                    </Button>
                {/if}
            </Layout.Stack>

            <Layout.Stack gap="m">
                <!-- Empty input for editing mode when no items exist -->
                {#if showEmptyInput}
                    <Layout.Stack direction="row">
                        <InputSelect
                            {id}
                            required
                            {options}
                            bind:value={relatedList[0]}
                            placeholder={`Select ${attribute.key}`}
                            on:change={() => {
                                if (!relatedList[0]) relatedList = [''];
                                updateRelatedList();
                            }} />
                    </Layout.Stack>
                {/if}

                <!-- Existing items in editing mode -->
                {#if editing && hasItems}
                    {#each paginatedItems as _, paginatedIndex}
                        {@const actualIndex = offset + paginatedIndex}
                        <Layout.Stack direction="row">
                            <InputSelect
                                {id}
                                required
                                options={getAvailableOptions(actualIndex)}
                                bind:value={relatedList[actualIndex]}
                                placeholder={`Select ${attribute.key}`}
                                on:change={updateRelatedList} />
                            {#if relatedList[actualIndex]}
                                <div style:padding-block-start="0.5rem">
                                    <Button
                                        icon
                                        extraCompact
                                        on:click={() => removeItem(actualIndex)}>
                                        <Icon icon={IconX} size="s" />
                                    </Button>
                                </div>
                            {/if}
                        </Layout.Stack>
                    {/each}
                {/if}

                <!-- Existing items in creation mode -->
                {#if !editing && hasItems}
                    {#each relatedList as item, i}
                        <Layout.Stack direction="row">
                            <InputSelect
                                {id}
                                required
                                options={getAvailableOptions(i)}
                                bind:value={item}
                                on:change={updateRelatedList} />
                            <div style:padding-block-start="0.5rem">
                                <Button
                                    icon
                                    extraCompact
                                    ariaLabel={`Delete item ${i}`}
                                    on:click={() => {
                                        relatedList.splice(i, 1);
                                        updateRelatedList();
                                    }}>
                                    <Icon icon={IconX} size="s" />
                                </Button>
                            </div>
                        </Layout.Stack>
                    {/each}
                {/if}

                <!-- Input for adding new items -->
                {#if showInput}
                    <Layout.Stack direction="row">
                        <InputSelect
                            {id}
                            required
                            placeholder={`Select ${attribute.key}`}
                            bind:value={newItemValue}
                            options={getAvailableOptions()}
                            on:change={addNewItem} />
                        <div style:padding-block-start="0.5rem">
                            <Button icon extraCompact on:click={cancelAddItem}>
                                <Icon icon={IconX} size="s" />
                            </Button>
                        </div>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>

            {#if showBottomAddButton}
                <Layout.Stack direction="row" alignContent="flex-start">
                    <Button extraCompact on:click={() => (showInput = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add item
                    </Button>
                </Layout.Stack>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
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
