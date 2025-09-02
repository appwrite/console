<script lang="ts">
    import { page } from '$app/state';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { type ComponentType, onMount } from 'svelte';
    import { isRelationshipToMany } from '../../store';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    type SelectOption = {
        label: string;
        value: string | null;
        data?: string[];
        disabled?: boolean;
        badge?: string;
        leadingIcon?: ComponentType;
    };

    export let id: string;
    export let label: string;
    export let limited: boolean = false;
    export let editing = false;
    export let value: object | string[];
    export let column: Models.ColumnRelationship;
    export let optionalText: string | undefined = undefined;

    const databaseId = page.params.database;

    let rowList: Models.RowList<Models.Row>;
    let row: Models.DefaultRow | Models.Row | undefined = undefined;

    let showInput = false;
    let singleRel: string;
    let search: string = null;
    let loadingRelationships = false;

    let newItemValue: string = '';
    let relatedList: string[] = [];

    let limit = 10;
    let offset = 0;

    onMount(async () => {
        if (isRelationshipToMany(column)) {
            if (Array.isArray(value)) {
                relatedList = value.map((item: object | string) => {
                    return typeof item === 'string' ? item : item['$id'];
                });
            }
        } else {
            if (value && typeof value === 'object') {
                row = value as Models.Row;
                singleRel = row?.$id;
            }
        }
    });

    async function getRows(search: string = null) {
        loadingRelationships = true;

        // already includes the `$id`, dw!
        const displayNames = preferences.getDisplayNames(column.relatedTable);

        const queries = search
            ? [Query.select(displayNames), Query.startsWith('$id', search), Query.orderDesc('')]
            : [Query.select(displayNames)];

        const rows = await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.listRows({
                databaseId,
                tableId: column.relatedTable,
                queries
            });

        loadingRelationships = false;

        return rows;
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

    function generateOptions(
        loading: boolean,
        rows: Models.Row[] | undefined,
        column: Models.ColumnRelationship
    ): SelectOption[] {
        if (loading) {
            return [{ label: 'Loading...', value: null, disabled: true }];
        }

        let baseOptions: SelectOption[] =
            rows?.map((row) => {
                const names = preferences
                    .getDisplayNames(column?.relatedTable)
                    .filter((name) => name !== '$id');

                const values = names
                    .map((name) => row?.[name])
                    .filter((value) => value != null && typeof value === 'string' && value !== '');

                let label: string;
                if (!values.length) {
                    label = row.$id;
                } else {
                    label = `${values.join(' | ')} (...${row.$id.slice(-5)})`;
                }

                return {
                    label,
                    value: row.$id,
                    data: names.map((name) => row?.[name])
                };
            }) ?? [];

        if (!isRelationshipToMany(column) && baseOptions.length && value && limited) {
            baseOptions = [
                {
                    value: null,
                    badge: 'Unlink',
                    label: 'Remove relationship'
                },
                ...baseOptions
            ];
        }

        return baseOptions;
    }

    // Reactive statements
    $: getRows(search).then((res) => (rowList = res));

    $: paginatedItems = editing
        ? relatedList
              .slice()
              .reverse()
              .slice(offset, offset + limit)
        : [];

    $: totalCount = relatedList?.length ?? 0;

    $: options = generateOptions(loadingRelationships, rowList?.rows, column);

    $: hasItems = totalCount > 0;

    $: showTopAddButton = !editing && totalCount === 0 && !showInput;

    $: showBottomAddButton =
        (!editing && hasItems && !showInput) ||
        (editing && hasItems && relatedList.every((item) => item) && !showInput);

    $: showEmptyInput = editing && totalCount === 0 && !showInput;

    $: if (limit && !isRelationshipToMany(column) && limited) {
        label = undefined;
    }
</script>

{#if isRelationshipToMany(column)}
    <Layout.Stack gap="xxl">
        <Layout.Stack gap="m">
            {#if !limited}
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
            {/if}

            <Layout.Stack gap="m">
                <!-- Empty input for editing mode when no items exist -->
                {#if showEmptyInput}
                    <Layout.Stack direction="row">
                        <InputSelect
                            {id}
                            required
                            {options}
                            bind:value={relatedList[0]}
                            placeholder={`Select ${column.key}`}
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
                                autofocus={limited}
                                options={getAvailableOptions(actualIndex)}
                                bind:value={relatedList[actualIndex]}
                                placeholder={`Select ${column.key}`}
                                on:change={updateRelatedList} />
                            {#if !limited}
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
                            placeholder={`Select ${column.key}`}
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

            {#if showBottomAddButton && !limited}
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
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <InputSelect
            {id}
            {options}
            autofocus={limited}
            bind:value={singleRel}
            required={column.required}
            label={limited ? undefined : label}
            placeholder={`Select ${column.key}`}
            on:change={() => {
                if (singleRel === null) {
                    value = null;
                } else {
                    value = rowList.rows.find((row) => row.$id === singleRel);
                }
            }} />

        {#if !limited && singleRel}
            <div style:padding-block-start="2.25rem">
                <Button
                    icon
                    extraCompact
                    on:click={() => {
                        value = null;
                        singleRel = null;
                    }}>
                    <Icon icon={IconX} size="s" />
                </Button>
            </div>
        {/if}
    </Layout.Stack>
{/if}
