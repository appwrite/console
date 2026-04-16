<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import ColumnItem from './columns/columnItem.svelte';
    import { toRelationalField, type Field } from '$database/(entity)';
    import type { Writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';

    let {
        workStore,
        columnsToRender,
        onUpdateFormValues,
        gap = 'l'
    }: {
        workStore: Writable<Models.Row>;
        columnsToRender: Field[];
        onUpdateFormValues: (formValues: object) => void;
        gap?: 'l' | 'm';
    } = $props();
</script>

<Layout.Stack direction="column" {gap}>
    {#each columnsToRender as column}
        {@const label = column.key}
        <ColumnItem
            {label}
            editing
            formValues={$workStore}
            column={toRelationalField(column)}
            {onUpdateFormValues} />
    {/each}
</Layout.Stack>
