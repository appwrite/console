<script lang="ts">
    import { ActionMenu } from '@appwrite.io/pink-svelte';
    import FiltersModal from './filtersModal.svelte';
    import type { Writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';

    export let columns: Writable<Column[]>;
    let show = false;
</script>

<ActionMenu.Root>
    <ActionMenu.Item.Button
        on:click={() => {
            show = true;
        }}>
        Custom filters
    </ActionMenu.Item.Button>
</ActionMenu.Root>

{#if show}
    <FiltersModal bind:show {columns} analyticsSource="custom-filters" />
{/if}
