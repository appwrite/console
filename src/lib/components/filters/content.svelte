<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTags,
        InputSelectCheckbox,
        InputDateTime
    } from '$lib/elements/forms';
    import { createEventDispatcher, onMount } from 'svelte';
    import { operators, addFilter, queries, type TagValue } from './store';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import { TagList } from '.';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    // We cast to any to not cause type errors in the input components
    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    export let value: any = null;
    export let columns: Writable<Column[]>;
    export let columnId: string | null = null;
    export let arrayValues: string[] = [];
    export let operatorKey: string | null = null;
    export let singleCondition = false;

    $: column = $columns.find((c) => c.id === columnId) as Column;

    $: operatorsForColumn = Object.entries(operators)
        .filter(([, v]) => v.types.includes(column?.type))
        .map(([k]) => ({
            label: k,
            value: k
        }));

    $: operator = operatorKey ? operators[operatorKey] : null;
    $: {
        columnId;
        operatorKey = null;
    }

    $: isDisabled = !operator;

    let localTags: TagValue[] = [];

    onMount(() => {
        value = column?.array ? [] : null;
        if (column?.type === 'datetime') {
            const today = new Date();
            value = today.toISOString();
        }
    });

    function addFilterAndReset() {
        addFilter($columns, columnId, operatorKey, value, arrayValues);
        columnId = null;
        operatorKey = null;
        value = null;
        arrayValues = [];
        if (singleCondition) {
            queries.apply();
        }
    }

    const dispatch = createEventDispatcher<{
        clear: void;
        apply: { applied: number };
    }>();
    dispatch('apply', { applied: localTags.length });
</script>

<div>
    <form on:submit|preventDefault={addFilterAndReset}>
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
                bind:value={columnId} />
            <InputSelect
                id="operator"
                disabled={!column}
                options={operatorsForColumn}
                placeholder="Select operator"
                bind:value={operatorKey} />
        </Layout.Stack>
        {#if column && operator && !operator?.hideInput}
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
            {:else}
                <ul class="u-margin-block-start-8">
                    {#if column.format === 'enum'}
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
                </ul>
            {/if}
        {/if}
        {#if !singleCondition}
            <Button text disabled={isDisabled} class="u-margin-block-start-4" submit>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add condition
            </Button>
        {/if}
    </form>

    {#if !singleCondition}
        <ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16 tags">
            <TagList
                tags={localTags}
                on:remove={(e) => {
                    queries.removeFilter(e.detail);
                    queries.apply();
                }} />
        </ul>
    {/if}
</div>
