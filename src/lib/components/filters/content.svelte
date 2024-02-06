<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTags,
        FormList
    } from '$lib/elements/forms';
    import { Query } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { tags, type Operator, queries } from './store';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';

    export let columns: Writable<Column[]>;

    const dispatch = createEventDispatcher<{
        clear: void;
        apply: { applied: number };
    }>();

    let columnId: string | null = null;
    $: column = $columns.find((c) => c.id === columnId) as Column;
    let arrayValues = [];

    dispatch('apply', { applied: $tags.length });

    const operators: Record<string, Operator> = {
        'starts with': {
            toQuery: Query.startsWith,
            toTag: (attribute, input) => `**${attribute}** starts with **${input}**`,
            types: ['string']
        },
        'ends with': {
            toQuery: Query.endsWith,
            toTag: (attribute, input) => `**${attribute}** ends with **${input}**`,
            types: ['string']
        },
        'greater than': {
            toQuery: (attr, input) => Query.greaterThan(attr, Number(input)),
            toTag: (attribute, input) => `**${attribute}** greater than **${input}**`,
            types: ['integer', 'double', 'datetime']
        },
        'greater than or equal to': {
            toQuery: (attr, input) => Query.greaterThanEqual(attr, Number(input)),
            toTag: (attribute, input) => `**${attribute}** greater than or equal to **${input}**`,
            types: ['integer', 'double', 'datetime']
        },
        'less than': {
            toQuery: Query.lessThan,
            toTag: (attribute, input) => `**${attribute}** less than **${input}**`,
            types: ['integer', 'double', 'datetime']
        },
        'less than or equal to': {
            toQuery: Query.lessThanEqual,
            toTag: (attribute, input) => `**${attribute}** less than or equal to **${input}**`,
            types: ['integer', 'double', 'datetime']
        },
        equal: {
            toQuery: Query.equal,
            toTag: (attribute, input) => `**${attribute}** equal to **${input}**`,
            types: ['string', 'integer', 'double', 'boolean']
        },
        'not equal to': {
            toQuery: Query.notEqual,
            toTag: (attribute, input) => `**${attribute}** not equal to **${input}**`,
            types: ['string', 'integer', 'double', 'boolean']
        },
        'not null': {
            toQuery: Query.isNotNull,
            toTag: (attribute) => `**${attribute}** is not null`,
            types: ['string', 'integer', 'double', 'boolean', 'datetime', 'relationship'],
            hideInput: true
        },
        null: {
            toQuery: Query.isNull,
            toTag: (attribute) => `**${attribute}** is null`,
            types: ['string', 'integer', 'double', 'boolean', 'datetime', 'relationship'],
            hideInput: true
        },
        contains: {
            toQuery: Query.contains,
            toTag: (attribute, input) =>
                `**${attribute}** contains **${Array.isArray(input) ? input.join(' or') : input}**`,
            types: ['string', 'integer', 'double', 'boolean', 'datetime', 'enum']
        }
    };

    $: operatorsForColumn = Object.entries(operators)
        .filter(([, v]) => v.types.includes(column?.type))
        .map(([k]) => ({
            label: k,
            value: k
        }));

    let operatorKey: string | null = null;
    $: operator = operatorKey ? operators[operatorKey] : null;
    $: {
        columnId;
        operatorKey = null;
    }

    // We cast to any to not cause type errors in the input components
    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    let value: any = null;

    $: {
        columnId;
        value = column?.array ? [] : null;
    }

    // This Map is keyed by tags, and has a query as the value
    function addFilter() {
        if (!column || !operator) return;

        queries.addFilter({ column, operator, value: value ?? '' });
        value = null;
    }

    function tagFormat(node: HTMLElement) {
        node.innerHTML = node.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    $: isDisabled = !operator;
</script>

<div>
    <form on:submit|preventDefault={addFilter}>
        <ul class="selects u-flex u-gap-8 u-margin-block-start-16">
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
        </ul>
        {#if column && operator && !operator?.hideInput}
            {#if column?.array}
                <FormList class="u-margin-block-start-8">
                    {#if column.type === 'enum'}
                        test
                        <!-- <InputSelect
                        id="value"
                        placeholder="Select a value"
                        required={true}
                        options={column.enum.map((v) => ({ label: v, value: v }))}
                        bind:value /> -->
                    {:else}
                        <InputTags
                            label="values"
                            showLabel={false}
                            id="value"
                            bind:tags={arrayValues}
                            placeholder="Enter values" />
                    {/if}
                </FormList>
            {:else}
                <ul class="u-margin-block-start-8">
                    {#if column.type === 'integer' || column.type === 'double'}
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
                    {:else}
                        <InputText id="value" bind:value placeholder="Enter value" />
                    {/if}
                </ul>
            {/if}
        {/if}
        <Button text disabled={isDisabled} class="u-margin-block-start-4" submit>
            <i class="icon-plus" />
            Add filter
        </Button>
    </form>

    <ul class="u-flex u-flex-wrap u-cross-center u-gap-8 u-margin-block-start-16 tags">
        {#each $tags as tag (tag)}
            <button
                class="tag"
                on:click={() => {
                    queries.removeFilter(tag);
                }}>
                <span class="text" use:tagFormat>
                    {tag}
                </span>
                <i class="icon-x" />
            </button>
        {/each}
    </ul>
</div>

<style lang="scss">
    .selects {
        :global(> *) {
            flex: 1;
        }
    }

    .tags {
        :global(b) {
            font-weight: bold;
        }
    }
</style>
