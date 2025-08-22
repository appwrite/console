<script lang="ts">
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import {
        Button,
        InputDateTime,
        InputNumber,
        InputSelect,
        InputSelectCheckbox,
        InputTags,
        InputText
    } from '$lib/elements/forms';
    import type { Writable } from 'svelte/store';
    import Modal from '../modal.svelte';
    import { generateTag, operators, ValidOperators, type TagValue } from './store';
    import type { Column } from '$lib/helpers/types';
    import { TagList } from '.';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { addFilterAndApply } from './quickFilters';

    export let show = false;
    export let columns: Writable<Column[]>;
    export let analyticsSource = '';
    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    let value: any = null;
    let selectedColumn: string | null = null;
    let operatorKey: string | null = null;
    let arrayValues: string[] = [];
    let localTags: TagValue[] = [];
    let localQueries: {
        id: string;
        operator: string;
        value: any;
        arrayValues: string[];
    }[] = [];

    function apply() {
        localQueries.forEach((query) => {
            addFilterAndApply(
                query.id,
                $columns.find((c) => c.id === query.id).title,
                query.operator as ValidOperators,
                query.value,
                query.arrayValues,
                $columns,
                analyticsSource
            );
        });

        localTags = [];
        localQueries = [];
        trackEvent(Submit.FilterApply, {
            source: analyticsSource,
            filters: localTags
        });
        show = false;
    }

    function addCondition() {
        const newTag = generateTag(selectedColumn, operatorKey, value || arrayValues);
        if (localTags.some((t) => t.tag === newTag.tag && t.value === newTag.value)) {
            return;
        } else {
            localQueries = [
                ...localQueries,
                {
                    id: selectedColumn,
                    operator: operatorKey,
                    value: value,
                    arrayValues: arrayValues
                }
            ];
            localTags = [...localTags, newTag];
        }
    }

    function removeCondition(tag: TagValue) {
        localTags = localTags.filter((t) => t !== tag);
    }

    function clearAll() {
        localTags = [];
        localQueries = [];
    }

    $: column = $columns.find((c) => c.id === selectedColumn) as Column;

    $: operatorsForColumn = Object.entries(operators)
        .filter(([, v]) => v.types.includes(column?.type))
        .map(([k]) => ({
            label: k,
            value: k
        }));
</script>

<Modal title="Filters" bind:show>
    <span slot="description"> Apply filter rules to refine the table view </span>

    <Layout.Stack>
        <Layout.Stack gap="s" direction="row" alignItems="flex-start">
            <InputSelect
                id="column"
                options={$columns
                    .filter((c) => c.filter !== false)
                    .map((c) => ({
                        label: c.title,
                        value: c.id
                    }))}
                placeholder="Select column"
                bind:value={selectedColumn} />
            <InputSelect
                id="operator"
                disabled={!column}
                options={operatorsForColumn}
                placeholder="Select operator"
                bind:value={operatorKey} />
        </Layout.Stack>
        {#if column && operatorKey}
            {#if column?.array}
                {#if column.format === 'enum'}
                    <InputSelectCheckbox
                        name="value"
                        bind:tags={arrayValues}
                        placeholder="Select value"
                        options={column?.elements?.map((e) => ({
                            label: e?.label ?? e,
                            value: e?.value ?? e,
                            checked: arrayValues.includes(e?.value ?? e)
                        }))}>
                    </InputSelectCheckbox>
                {:else}
                    <InputTags
                        label="values"
                        id="value"
                        bind:tags={arrayValues}
                        placeholder="Enter values" />
                {/if}
            {:else if column.format === 'enum'}
                <InputSelect
                    id="value"
                    bind:value
                    placeholder="Select value"
                    options={column?.elements?.map((e) => ({
                        label: e?.label ?? e,
                        value: e?.value ?? e
                    }))} />
            {:else if column.type === 'integer' || column.type === 'double'}
                <InputNumber id="value" bind:value placeholder="Enter value" />
            {:else if column.type === 'boolean'}
                <InputSelect
                    id="value"
                    placeholder="Select a value"
                    required={true}
                    options={[
                        { label: 'True', value: true },
                        { label: 'False', value: false }
                    ].filter(Boolean)}
                    bind:value />
            {:else if column.type === 'datetime'}
                {#key value}
                    <InputDateTime id="value" bind:value step={60} type="datetime-local" />
                {/key}
            {:else}
                <InputText id="value" bind:value placeholder="Enter value" />
            {/if}
        {/if}
        <div>
            <Button text on:click={addCondition}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add condition
            </Button>
        </div>
    </Layout.Stack>
    {#if localTags?.length}
        <Layout.Stack direction="row" gap="s" alignItems="center" wrap="wrap">
            <TagList tags={localTags} on:remove={(e) => removeCondition(e.detail)} />
        </Layout.Stack>
    {/if}

    <svelte:fragment slot="footer">
        {#if localTags?.length}
            <Button size="s" text on:click={clearAll}>Clear all</Button>
        {:else}
            <Button size="s" text on:click={() => (show = false)}>Cancel</Button>
        {/if}
        <Button size="s" on:click={apply} disabled={!localTags?.length}>Apply</Button>
    </svelte:fragment>
</Modal>
