<script lang="ts" context="module">
    const columnTypes = ['string', 'number', 'relationship'] as const;
    type ColumnType = (typeof columnTypes)[number];

    type StoreValues<Store> = Store extends Writable<infer T> ? T : never;
    type Column = Omit<StoreValues<typeof columns>[number], 'type'> & {
        type: ColumnType;
    };

    type Operator = {
        toTag: (attribute: string, input: string) => string;
        toQuery: (attribute: string, input: string) => string;
        types: ColumnType[];
    };

    function initQueries() {
        const queries = writable(
            new Map<string, string>([
                ['**name** starts with **Th**', Query.startsWith('name', 'Th')]
            ])
        );

        type AddFilterArgs = {
            operator: Operator;
            column: Column;
            value: string;
        };

        function addFilter({ column, operator, value }: AddFilterArgs) {
            queries.update((map) => {
                map.set(operator.toTag(column.id, value), operator.toQuery(column.id, value));
                return map;
            });
        }

        function removeFilter(tag: string) {
            queries.update((map) => {
                map.delete(tag);
                return map;
            });
        }

        function clearAll() {
            queries.set(new Map());
        }

        function apply() {
            const queryParam = JSON.stringify(Array.from(get(queries)).map(([_, v]) => v));

            const encodedQueryParam = encodeURIComponent(queryParam);
            const currentLocation = window.location.pathname;
            goto(`${currentLocation}?query=${encodedQueryParam}`);
        }

        return {
            ...queries,
            addFilter,
            removeFilter,
            clearAll,
            apply
        };
    }

    const queries = initQueries();
    const tags = derived(queries, ($queries) => Array.from($queries.keys()));
</script>

<script lang="ts">
    import { Drop } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { derived, get, writable, type Writable } from 'svelte/store';
    import { columns } from './store';
    import { Query } from '@appwrite.io/console';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { goto } from '$app/navigation';
    import { tick } from 'svelte';

    let showFilters = false;

    let columnId: string | null = null;
    $: column = $columns.find((c) => c.id === columnId) as Column;

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
            toQuery: Query.greaterThan,
            toTag: (attribute, input) => `**${attribute}** greater than **${input}**`,
            types: ['number']
        },
        'less than': {
            toQuery: Query.lessThan,
            toTag: (attribute, input) => `**${attribute}** less than **${input}**`,
            types: ['number']
        }
    };

    $: operatorsForColumn = Object.entries(operators)
        .filter(([_, v]) => v.types.includes(column?.type))
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

    let value: string | null = null;
    $: {
        columnId;
        value = null;
    }

    // This Map is keyed by tags, and has a query as the value

    function addFilter() {
        if (column && operator && value) {
            queries.addFilter({ column, operator, value });
        }
    }

    function tagFormat(node: HTMLElement) {
        node.innerHTML = node.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }
</script>

<Drop bind:show={showFilters} noArrow>
    <Button secondary on:click={() => (showFilters = !showFilters)}>
        <i class="icon-filter" />
        Filters
    </Button>
    <div class="dropped" slot="list">
        <p>Apply filter rules to refine the table view</p>
        <div class="selects u-flex u-gap-12 u-margin-block-start-16">
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
                options={operatorsForColumn}
                placeholder="Select operator"
                bind:value={operatorKey} />
        </div>
        {#if column && operatorKey}
            <div class="u-margin-block-start-16">
                <InputText id="value" bind:value placeholder="Enter value" />
            </div>
        {/if}
        <Button text disabled={!value} class="u-margin-block-start-12" on:click={addFilter}>
            <i class="icon-plus" />
            Add filter
        </Button>
        <ul class="tags">
            {#each $tags as tag (tag)}
                <button
                    class="tag"
                    on:click={() => {
                        queries.removeFilter(tag);
                        tick().then(() => {
                            showFilters = true;
                        });
                    }}>
                    <span class="text" use:tagFormat>
                        {tag}
                    </span>
                    <i class="icon-x" />
                </button>
            {/each}
        </ul>
        <hr />
        <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
            <Button text on:click={queries.clearAll}>Clear all</Button>
            <Button
                on:click={() => {
                    queries.apply();
                    showFilters = false;
                }}>Apply</Button>
        </div>
    </div>
</Drop>

<style lang="scss">
    .icon-filter {
        color: hsl(var(--color-neutral-50));
    }

    .dropped {
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--color-neutral-10));
        background-color: hsl(var(--color-neutral-0));
        box-shadow: 0px 16px 32px 0px rgba(55, 59, 77, 0.04);

        padding: 1rem;
        margin-top: 0.5rem;

        width: 37.5rem;
    }

    .selects {
        :global(> *) {
            flex: 1;
        }
    }

    .tags {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;

        margin-block-start: 1rem;

        :global(b) {
            font-weight: bold;
        }
    }

    hr {
        height: 1px;
        width: calc(100% + 2rem);
        background-color: hsl(var(--color-neutral-10));

        margin-block-start: 1rem;
        margin-inline: -1rem;
    }
</style>
