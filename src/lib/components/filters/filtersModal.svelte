<script lang="ts">
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import type { Writable } from 'svelte/store';
    import Modal from '../modal.svelte';
    import Content from './content.svelte';
    import { addFilter, queries, queriesAreDirty, tags, ValidOperators } from './store';
    import type { Column } from '$lib/helpers/types';

    export let show = false;
    export let columns: Writable<Column[]>;
    export let analyticsSource = '';
    export let clearOnClick = false;
    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    let value: any = null;
    let selectedColumn: string | null = null;
    let operatorKey: string | null = null;
    let arrayValues: string[] = [];

    let applied = $tags.length;

    function clearAll() {
        selectedColumn = null;
        queries.clearAll();
        if (clearOnClick) {
            trackEvent(Submit.FilterClear, { source: analyticsSource });
            queries.apply();
        }
    }

    function apply() {
        if (
            selectedColumn &&
            operatorKey &&
            (operatorKey === ValidOperators.IsNotNull ||
                operatorKey === ValidOperators.IsNull ||
                value ||
                arrayValues.length)
        ) {
            addFilter($columns, selectedColumn, operatorKey, value, arrayValues);
            selectedColumn = null;
            value = null;
            operatorKey = null;
            arrayValues = [];
        }
        queries.apply();
    }

    $: isButtonDisabled = $queriesAreDirty
        ? false
        : !selectedColumn ||
          !operatorKey ||
          (!value &&
              !arrayValues.length &&
              operatorKey !== ValidOperators.IsNotNull &&
              operatorKey !== ValidOperators.IsNull);
</script>

<Modal title="Filters" bind:show>
    <span slot="description"> Apply filter rules to refine the table view </span>

    <Content
        {columns}
        bind:columnId={selectedColumn}
        bind:operatorKey
        bind:value
        bind:arrayValues
        on:clear={() => (applied = 0)} />
    <svelte:fragment slot="footer">
        <Button size="s" text on:click={clearAll}>Clear all</Button>
        <Button size="s" on:click={apply} disabled={isButtonDisabled}>Apply</Button>
    </svelte:fragment>
</Modal>
