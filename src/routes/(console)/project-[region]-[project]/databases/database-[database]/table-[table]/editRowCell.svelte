<script lang="ts">
    import deepEqual from 'deep-equal';
    import type { Columns } from './store';
    import type { Models } from '@appwrite.io/console';
    import ColumnItem from './row-[row]/columnItem.svelte';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';

    let {
        column,
        row = $bindable(null),
        onRowStructureUpdate = null
    }: {
        row: Models.Row;
        column: Columns;
        onRowStructureUpdate?: (row: Models.Row) => Promise<boolean>;
    } = $props();

    let original: Models.Row;
    let wrapperEl: HTMLDivElement;
    const dispatch = createEventDispatcher();

    onMount(() => {
        original = structuredClone(row);

        const trigger = wrapperEl.querySelector('button.input') as HTMLButtonElement;
        if (trigger) {
            trigger.click();
        }
    });

    /**
     * fire on `onDestroy` because at this point,
     * the cell editor slot fragment is closed and enter was hit!
     */
    onDestroy(async () => {
        const hasChanged = !deepEqual(original, row);
        if (hasChanged && onRowStructureUpdate) {
            const accepted = await onRowStructureUpdate(row);
            if (!accepted) {
                row = original;
                dispatch('revert', original);
            }
        }
    });

    $effect(() => {
        if (!deepEqual(original, row)) {
            dispatch('change', row);
        }
    });
</script>

<div style:width="100%" bind:this={wrapperEl}>
    <ColumnItem {column} fromSpreadsheet bind:formValues={row} label={undefined} editing />
</div>
