<script lang="ts">
    import { Button, InputNumber } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
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
        value = null;
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
        <div class="selects u-flex u-gap-8 u-margin-block-start-16">
            <InputSelect
                id="column"
                options={$columns.map((c) => ({
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
        </div>
        {#if column && operator && !operator?.hideInput}
            <div class="u-margin-block-start-8">
                {#if column.type === 'integer' || column.type === 'double'}
                    <InputNumber id="value" bind:value placeholder="Enter value" />
                {:else}
                    <InputText id="value" bind:value placeholder="Enter value" />
                {/if}
            </div>
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
