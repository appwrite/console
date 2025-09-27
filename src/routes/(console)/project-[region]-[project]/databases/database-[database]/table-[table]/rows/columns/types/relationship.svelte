<script lang="ts">
    import { page } from '$app/state';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { type ComponentType, onMount } from 'svelte';
    import { isRelationshipToMany } from '../../store';
    import { IconPlus, IconRelationship, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Input, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { debounce } from '$lib/helpers/debounce';

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
    let loadingRelationships = false;

    let newItemValue: string = '';
    let relatedList: string[] = [];

    let limit = 10;
    let offset = 0;

    let searchNoResultsOption = undefined;

    /**
     * list of loaded rows to tune with searching!
     *
     * this is used when the view is not searching anything,
     * therefore we don't have to make an API call again!
     *
     * Example:
     * 1. initial rows are loaded -> cache the rows
     * 2. user makes a search -> api call -> not results found
     * 3. user clears the search -> this variable sets the rowsList back!
     *
     * `#3` allows us to not make a call to getRows again, saves time and bandwidth!
     */
    let cachedRowsCopyList: Models.RowList<Models.Row>;

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
                // set for combobox and select.
                newItemValue = singleRel = row?.$id;
            }
        }
    });

    async function getRows() {
        loadingRelationships = true;

        // already includes the `$id`, dw!
        const displayNames = preferences.getDisplayNames(column.relatedTable);

        const rows = await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.listRows({
                databaseId,
                tableId: column.relatedTable,
                // limit `5` as `25` would look too much on sheet!
                queries: [Query.select(displayNames), Query.limit(5)]
            });

        cachedRowsCopyList = rows;
        loadingRelationships = false;

        return rows;
    }

    async function searchRows(search: string = null) {
        if (!search) return;

        const displayNames = preferences.getDisplayNames(column.relatedTable);

        const queries = [];
        displayNames.forEach((name) => queries.push(Query.contains(name, [search])));

        return await sdk.forProject(page.params.region, page.params.project).tablesDB.listRows({
            databaseId,
            tableId: column.relatedTable,
            queries
        });
    }

    function getAvailableOptions(excludeIndex?: number): SelectOption[] {
        const source = options ?? [];
        return source?.filter((option) => {
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
            newItemValue = null;
            showInput = false;
        }
    }

    function cancelAddItem() {
        newItemValue = null;
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

    const debouncedSearch = debounce(async (searchTerm: string) => {
        const availableOptions = getAvailableOptions();
        const includesItem = availableOptions
            .filter((opt) => {
                const label = String(opt.label ?? '').toLowerCase();
                const value = String(opt.value ?? '').toLowerCase();
                return (
                    label.includes(searchTerm.toLowerCase()) ||
                    value.includes(searchTerm.toLowerCase())
                );
            })
            .filter(Boolean);

        if (!includesItem.length) {
            try {
                searchNoResultsOption = {
                    disabled: true,
                    message: 'Searching...'
                };

                const searchResults = await searchRows(searchTerm);
                if (searchResults) {
                    rowList = searchResults;
                }
            } finally {
                searchNoResultsOption = undefined;
            }
        } else if (cachedRowsCopyList) {
            rowList = cachedRowsCopyList;
        }
    }, 500);

    // Reactive statements
    $: if (!newItemValue && !cachedRowsCopyList) {
        getRows().then((response) => (rowList = response));
    }

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

    $: if (newItemValue) {
        debouncedSearch(newItemValue);
    } else if (!newItemValue && cachedRowsCopyList) {
        rowList = cachedRowsCopyList;
        searchNoResultsOption = undefined;
    }
</script>

{#if isRelationshipToMany(column)}
    <Layout.Stack gap="xxl">
        <Layout.Stack gap="m">
            {#if !limited}
                <Layout.Stack direction="row" alignContent="space-between">
                    <Layout.Stack gap="xxs" direction="row" alignItems="center">
                        <Icon icon={IconRelationship} size="s" color="--fgcolor-neutral-weak" />

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
                            }}
                            leadingIcon={!limited ? IconRelationship : undefined} />
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
                                on:change={updateRelatedList}
                                leadingIcon={!limited ? IconRelationship : undefined} />

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
                                on:change={updateRelatedList}
                                leadingIcon={!limited ? IconRelationship : undefined} />

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
                    {@const availableOptions = getAvailableOptions()}
                    {@const noAvailableOptions = availableOptions.length <= 0}
                    {#key availableOptions}
                        <Layout.Stack direction="row">
                            <Input.ComboBox
                                {id}
                                required
                                on:change={addNewItem}
                                bind:value={newItemValue}
                                options={availableOptions}
                                disabled={noAvailableOptions}
                                placeholder={noAvailableOptions
                                    ? 'No related items available'
                                    : `Select ${column.key}`}
                                noResultsOption={searchNoResultsOption}
                                leadingIcon={!limited ? IconRelationship : undefined} />

                            <div style:padding-block-start="0.5rem">
                                <Button icon extraCompact on:click={cancelAddItem}>
                                    <Icon icon={IconX} size="s" />
                                </Button>
                            </div>
                        </Layout.Stack>
                    {/key}
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
        {#key options}
            {#if limited}
                <!-- for unlink badge -->
                <Input.Select
                    {id}
                    {options}
                    autofocus={limited}
                    bind:value={newItemValue}
                    required={column.required}
                    label={limited ? undefined : label}
                    placeholder={`Select ${column.key}`}
                    noResultsOption={searchNoResultsOption}
                    on:change={() => {
                        if (newItemValue === null) {
                            value = null;
                            singleRel = null;
                        } else {
                            const selectedRow = rowList.rows.find(
                                (row) => row.$id === newItemValue
                            );

                            if (selectedRow) {
                                value = selectedRow;
                                singleRel = newItemValue;
                            }
                        }
                    }}
                    leadingIcon={!limited ? IconRelationship : undefined} />
            {:else}
                {@const noOptions = options.length <= 0}
                <Input.ComboBox
                    {id}
                    {options}
                    autofocus={limited}
                    bind:value={newItemValue}
                    required={column.required}
                    label={limited ? undefined : label}
                    disabled={noOptions}
                    placeholder={noOptions ? 'No related items available' : `Select ${column.key}`}
                    noResultsOption={searchNoResultsOption}
                    on:change={() => {
                        if (newItemValue === null) {
                            value = null;
                            singleRel = null;
                        } else {
                            const selectedRow = rowList.rows.find(
                                (row) => row.$id === newItemValue
                            );

                            if (selectedRow) {
                                value = selectedRow;
                                singleRel = newItemValue;
                            }
                        }
                    }}
                    leadingIcon={!limited ? IconRelationship : undefined} />
            {/if}

            {#if !limited && singleRel}
                <div style:padding-block-start="2.25rem">
                    <Button
                        icon
                        extraCompact
                        on:click={() => {
                            value = null;
                            newItemValue = singleRel = null;
                        }}>
                        <Icon icon={IconX} size="s" />
                    </Button>
                </div>
            {/if}
        {/key}
    </Layout.Stack>
{/if}
