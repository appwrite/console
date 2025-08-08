<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Columns } from './store';
    import type { Models } from '@appwrite.io/console';
    import ColumnItem from './row-[row]/columnItem.svelte';
    import deepEqual from 'deep-equal';

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
            }
        }
    });
</script>

<div style:width="100%" bind:this={wrapperEl}>
    <ColumnItem {column} fromSpreadsheet bind:formValues={row} label={undefined} editing />
</div>
