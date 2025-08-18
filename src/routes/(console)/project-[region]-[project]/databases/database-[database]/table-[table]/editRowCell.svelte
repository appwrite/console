<script lang="ts">
    import deepEqual from 'deep-equal';
    import type { Columns } from './store';
    import { onDestroy, onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import ColumnItem from './row-[row]/columnItem.svelte';

    let {
        column,
        row = $bindable(null),
        onChange = null,
        onRevert = null,
        openSideSheet = null,
        onRowStructureUpdate = null
    }: {
        row: Models.Row;
        column: Columns;
        openSideSheet?: () => void;
        onChange?: (row: Models.DefaultRow) => void;
        onRevert?: (row: Models.DefaultRow) => void;
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
                onRevert?.(original as Models.DefaultRow);
            }
        }
    });

    $effect(() => {
        if (!deepEqual(original, row)) {
            onChange?.(row as Models.DefaultRow);
        }
    });
</script>

<div style:width="100%" bind:this={wrapperEl}>
    <ColumnItem
        {column}
        editing
        fromSpreadsheet
        label={undefined}
        bind:formValues={row}
        on:click={openSideSheet} />
</div>
