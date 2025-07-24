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
    import { onMount, createEventDispatcher } from 'svelte';
    import { operators, addFilter, queries, tags } from './store';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import { TagList } from '.';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = $bindable(null),
        columns,
        columnId = $bindable(null),
        arrayValues = $bindable([]),
        operatorKey = $bindable(null),
        singleCondition = false
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value?: any;
        columns: Writable<Column[]>;
        columnId?: string | null;
        arrayValues?: string[];
        operatorKey?: string | null;
        singleCondition?: boolean;
    } = $props();

    let columnsArray = $derived($columns);
    let column = $derived(columnsArray.find((c) => c.id === columnId));
    let operatorsForColumn = $derived.by(() => {
        if (!column?.type) return [];
        return Object.entries(operators)
            .filter(([, v]) => v.types.includes(column.type))
            .map(([k]) => ({ label: k, value: k }));
    });
    let operator = $derived(operatorKey ? operators[operatorKey] : null);
    let isDisabled = $derived(!operator);
    let appliedTags = $derived($tags);
    let columnOptions = $derived.by(() =>
        columnsArray.filter((c) => c.filter !== false).map((c) => ({ label: c.title, value: c.id }))
    );
    let enumOptions = $derived.by(() => {
        if (!column?.elements) return [];
        return column.elements.map((e) => ({ label: e?.label ?? e, value: e?.value ?? e }));
    });
    let enumOptionsWithChecked = $derived.by(() => {
        if (!column?.elements) return [];
        return column.elements.map((e) => ({
            label: e?.label ?? e,
            value: e?.value ?? e,
            checked: arrayValues.includes(e?.value ?? e)
        }));
    });

    onMount(() => {
        value = column?.array ? [] : null;
        if (column?.type === 'datetime') {
            const today = new Date();
            value = today.toISOString();
        }
    });

    const dispatch = createEventDispatcher<{ clear: void; apply: { applied: number } }>();

    function addFilterAndReset() {
        addFilter(columnsArray, columnId, operatorKey, value, arrayValues);
        columnId = null;
        operatorKey = null;
        value = null;
        arrayValues = [];
        dispatch('apply', { applied: appliedTags.length });
        if (singleCondition) {
            queries.apply();
        }
    }
</script>

<div>
    <form on:submit|preventDefault={addFilterAndReset}>
        <Layout.Stack gap="s" direction="row" alignItems="flex-start">
            <InputSelect
                id="column"
                options={columnOptions}
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
                        options={enumOptionsWithChecked}>
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
                            options={enumOptions} />
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
                            ]}
                            bind:value />
                    {:else if column.type === 'datetime'}
                        {#key value}
                            <InputDateTime id="value" bind:value step={60} />
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

    {#if !singleCondition && appliedTags.length > 0}
        <ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16 tags">
            <TagList
                tags={appliedTags}
                on:remove={(e) => {
                    queries.removeFilter(e.detail);
                    queries.apply();
                }} />
        </ul>
    {/if}
</div>
