<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTags,
        InputSelectCheckbox,
        InputDateTime,
        InputPoint
    } from '$lib/elements/forms';
    import { onMount, createEventDispatcher } from 'svelte';
    import { operators, addFilter, queries, tags, ValidOperators } from './store';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import { TagList } from '.';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let {
        value = $bindable(null),
        distanceValue = $bindable(null),
        columns,
        columnId = $bindable(null),
        arrayValues = $bindable([]),
        operatorKey = $bindable(null),
        singleCondition = false
    }: {
        // We cast to any to not cause type errors in the input components
        /* eslint  @typescript-eslint/no-explicit-any: 'off' */
        value?: any;
        distanceValue?: number | null;
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

    // Check if the current operator is a distance-based operator
    let isDistanceOperator = $derived(
        operatorKey &&
            [
                ValidOperators.DistanceEqual,
                ValidOperators.DistanceNotEqual,
                ValidOperators.DistanceGreaterThan,
                ValidOperators.DistanceLessThan
            ].includes(operatorKey as ValidOperators)
    );

    onMount(() => {
        value = column?.array ? [] : null;
        if (column?.type === 'datetime') {
            const now = new Date();
            value = now.toISOString().slice(0, 16);
        }
        // Initialize spatial data with default values
        if (column?.type === 'point') {
            value = [0, 0];
        } else if (column?.type === 'linestring') {
            value = [
                [0, 0],
                [1, 1]
            ];
        } else if (column?.type === 'polygon') {
            value = [
                [
                    [0, 0],
                    [1, 1],
                    [2, 2],
                    [0, 0]
                ]
            ];
        }
    });

    const dispatch = createEventDispatcher<{ clear: void; apply: { applied: number } }>();

    function addFilterAndReset() {
        // For distance operators, pass the distance as a separate parameter
        if (isDistanceOperator && distanceValue !== null && value !== null) {
            addFilter(columnsArray, columnId, operatorKey, value, arrayValues, distanceValue);
        } else {
            addFilter(columnsArray, columnId, operatorKey, value, arrayValues);
        }

        columnId = null;
        operatorKey = null;
        value = null;
        distanceValue = null;
        arrayValues = [];
        dispatch('apply', { applied: appliedTags.length });
        if (singleCondition) {
            queries.apply();
        }
    }
</script>

<div>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            addFilterAndReset();
        }}>
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
                            <InputDateTime id="value" bind:value step={60} type="datetime-local" />
                        {/key}
                    {:else if column.type === 'point' || column.type === 'linestring' || column.type === 'polygon'}
                        <InputPoint
                            values={value || [0, 0]}
                            onChangePoint={(index, newValue) => {
                                if (!value) value = [0, 0];
                                value[index] = newValue;
                            }} />
                    {:else}
                        <InputText id="value" bind:value placeholder="Enter value" />
                    {/if}
                </ul>
            {/if}

            {#if isDistanceOperator}
                <div class="u-margin-block-start-8">
                    <InputNumber
                        id="distance"
                        bind:value={distanceValue}
                        placeholder="Enter distance"
                        step={0.001}
                        required />
                </div>
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
