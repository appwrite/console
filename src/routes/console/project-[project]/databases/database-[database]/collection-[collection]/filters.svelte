<script lang="ts">
    import { Drop } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import type { Writable } from 'svelte/store';
    import { columns } from './store';
    import { Query } from '@appwrite.io/console';
    import InputText from '$lib/elements/forms/inputText.svelte';

    let showFilters = false;

    const columnTypes = ['string', 'number'] as const;
    type ColumnType = (typeof columnTypes)[number];

    type StoreValues<Store> = Store extends Writable<infer T> ? T : never;
    type Column = Omit<StoreValues<typeof columns>[number], 'type'> & {
        type: ColumnType;
    };

    let columnId: string | null = null;
    $: column = $columns.find((c) => c.id === columnId) as Column;

    const operators: Array<{
        label: string;
        function: (attribute: string, input: string) => string;
        types: ColumnType[];
    }> = [
        {
            label: 'starts with',
            function: Query.startsWith,
            types: ['string']
        }
    ];

    $: operatorsForColumn = operators
        .filter((o) => o.types.includes(column?.type))
        .map((o) => ({
            label: o.label,
            value: o.label
        }));
    let operator: string | null = null;
    $: {
        columnId;
        operator = null;
    }

    let value: string | null = null;
    $: {
        columnId;
        value = null;
    }

    let filters = [] as string[];

    function addFilter() {
        if (column && operator && value) {
            filters.push(`${column.id}:${operator}:${value}`);
            filters = filters;
        }
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
                bind:value={operator} />
        </div>
        {#if column && operator}
            <div class="u-margin-block-start-16">
                <InputText id="value" bind:value />
            </div>
        {/if}
        <Button text disabled={!value} class="u-margin-block-start-12" on:click={addFilter}>
            <i class="icon-plus" />
            Add filter
        </Button>
        {filters}
        <hr />
        <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
            <Button text>Clear all</Button>
            <Button>Apply</Button>
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

    hr {
        height: 1px;
        width: calc(100% + 2rem);
        background-color: hsl(var(--color-neutral-10));

        margin-block-start: 1rem;
        margin-inline: -1rem;
    }
</style>
