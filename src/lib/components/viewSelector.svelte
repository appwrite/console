<script lang="ts">
    import type { Writable } from 'svelte/store';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { Icon, Button } from '@appwrite.io/pink-svelte';
    import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
    import ViewToggle from './viewToggle.svelte';
    import ColumnSelector from './columnSelector.svelte';

    export let columns: Writable<Column[]>;
    export let view: View;
    export let isCustomCollection = false;
    export let hideView = false;
    export let hideColumns = false;
    export let allowNoColumns = false;
</script>

{#if !hideColumns && view === View.Table}
    <ColumnSelector {columns} {isCustomCollection} {allowNoColumns}>
        {#snippet children(toggle, selectedColumnsNumber)}
            <Button.Button
                size="s"
                variant="secondary"
                badge={selectedColumnsNumber.toString()}
                on:click={toggle}>
                <Icon slot="start" icon={IconViewBoards} />
            </Button.Button>
        {/snippet}
    </ColumnSelector>
{/if}

{#if !hideView}
    <ViewToggle bind:view />
{/if}
