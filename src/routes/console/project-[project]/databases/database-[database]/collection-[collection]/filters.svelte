<script lang="ts" context="module">
    const columnTypes = [
        'string',
        'integer',
        'double',
        'boolean',
        'datetime',
        'relationship'
    ] as const;
    type ColumnType = (typeof columnTypes)[number];

    type StoreValues<Store> = Store extends Writable<infer T> ? T : never;
    type Column = Omit<StoreValues<typeof columns>[number], 'type'> & {
        type: ColumnType;
    };

    type Operator = {
        toTag: (attribute: string, input?: string | number) => string;
        toQuery: (attribute: string, input?: string | number) => string;
        types: ColumnType[];
        hideInput?: boolean;
    };

    function mapToQueryParams(map: Map<string, string>) {
        return encodeURIComponent(JSON.stringify(Array.from(map.entries())));
    }

    function queryParamToMap(queryParam: string) {
        const decodedQueryParam = decodeURIComponent(queryParam);
        const queries = JSON.parse(decodedQueryParam) as [string, string][];
        return new Map(queries);
    }

    function initQueries(initialValue = new Map<string, string>()) {
        const queries = writable(initialValue);

        type AddFilterArgs = {
            operator: Operator;
            column: Column;
            value: string | number;
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
            const queryParam = mapToQueryParams(get(queries));
            const currentLocation = window.location.pathname;
            goto(`${currentLocation}?query=${queryParam}`);
        }

        return {
            ...queries,
            addFilter,
            removeFilter,
            clearAll,
            apply
        };
    }
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { Drop } from '$lib/components';
    import { Button, InputNumber } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { Query } from '@appwrite.io/console';
    import { derived, get, writable, type Writable } from 'svelte/store';
    import { columns } from './store';
    import { page } from '$app/stores';

    let showFilters = false;

    let columnId: string | null = null;
    $: column = $columns.find((c) => c.id === columnId) as Column;

    const queries = initQueries(queryParamToMap($page.url.searchParams.get('query') || '[]'));
    const tags = derived(queries, ($queries) => Array.from($queries.keys()));

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
            types: ['integer', 'double']
        },
        'greater than or equal to': {
            toQuery: (attr, input) => Query.greaterThanEqual(attr, Number(input)),
            toTag: (attribute, input) => `**${attribute}** greater than or equal to **${input}**`,
            types: ['integer', 'double']
        },
        'less than': {
            toQuery: Query.lessThan,
            toTag: (attribute, input) => `**${attribute}** less than **${input}**`,
            types: ['integer', 'double']
        },
        'less than or equal to': {
            toQuery: Query.lessThanEqual,
            toTag: (attribute, input) => `**${attribute}** less than or equal to **${input}**`,
            types: ['integer', 'double']
        },
        equal: {
            toQuery: Query.equal,
            toTag: (attribute, input) => `**${attribute}** equal to **${input}**`,
            types: ['string', 'integer', 'double']
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

    // We cast to any to not cause type errors in the input components
    let value: any = null;

    $: {
        columnId;
        value = null;
    }

    // This Map is keyed by tags, and has a query as the value
    function addFilter() {
        if (column && operator) {
            queries.addFilter({ column, operator, value });
            value = null;
        }
    }

    function tagFormat(node: HTMLElement) {
        node.innerHTML = node.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    let applied = $queries.size;

    function apply() {
        queries.apply();
        applied = $tags.length;
        showFilters = false;
    }

    function clearAll() {
        queries.clearAll();
        queries.apply();
        applied = 0;
        showFilters = false;
    }

    $: isDisabled = (function getDisabled() {
        return !operator || (!operator?.hideInput && !value);
    })();
</script>

<Drop bind:show={showFilters} noArrow>
    <Button secondary on:click={() => (showFilters = !showFilters)}>
        <i class="icon-filter" />
        Filters
        {#if applied > 0}
            <span class="inline-tag">
                {applied}
            </span>
        {/if}
    </Button>
    <div class="dropped card" slot="list">
        <form on:submit={addFilter}>
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
                    disabled={!column}
                    options={operatorsForColumn}
                    placeholder="Select operator"
                    bind:value={operatorKey} />
            </div>
            {#if column && operator && !operator?.hideInput}
                <div class="u-margin-block-start-16">
                    {#if column.type === 'integer' || column.type === 'double'}
                        <InputNumber id="value" bind:value placeholder="Enter value" />
                    {:else}
                        <InputText id="value" bind:value placeholder="Enter value" />
                    {/if}
                </div>
            {/if}
            <Button text disabled={isDisabled} class="u-margin-block-start-12" submit>
                <i class="icon-plus" />
                Add filter
            </Button>
        </form>

        <ul class="tags">
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
        <hr />
        <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
            <Button text on:click={clearAll}>Clear all</Button>
            <Button on:click={apply}>Apply</Button>
        </div>
    </div>
</Drop>

<style lang="scss">
    .icon-filter {
        color: hsl(var(--color-neutral-50));
    }

    .dropped {
        border-radius: 0.5rem;
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
        background-color: hsl(var(--color-border));

        margin-block-start: 1rem;
        margin-inline: -1rem;
    }
</style>
