<script lang="ts">
    import type { Writable } from 'svelte/store';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { Icon, Button } from '@appwrite.io/pink-svelte';
    import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
    import ViewToggle from './viewToggle.svelte';
    import ColumnSelector from './columnSelector.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    export let onlyIcon = false;
    export let ui: 'legacy' | 'new' = 'legacy';
    export let columns: Writable<Column[]>;
    export let view: View;
    export let isCustomTable = false;
    export let hideView = false;
    export let hideColumns = false;
    export let allowNoColumns = false;
    export let showAnyway = false;
</script>

{#if !hideColumns && view === View.Table}
    <ColumnSelector {columns} {isCustomTable} {allowNoColumns} {ui} {showAnyway}>
        {#snippet children(toggle, selectedColumnsNumber)}
            <Button.Button
                size="s"
                icon={onlyIcon}
                variant="secondary"
                class={onlyIcon && !$isSmallViewport ? 'width-fix' : undefined}
                disabled={!$columns.length && showAnyway}
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

<style>
    :global(.width-fix) {
        width: 32px;
        height: 32px;
    }
</style>
