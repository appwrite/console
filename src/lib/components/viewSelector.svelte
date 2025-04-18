<script lang="ts">
    import { InputCheckbox } from '$lib/elements/forms';
    import { page } from '$app/state';
    import type { Writable } from 'svelte/store';
    import { preferences } from '$lib/stores/preferences';
    import { onMount } from 'svelte';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import {
        ActionMenu,
        Icon,
        Layout,
        Popover,
        ToggleButton,
        Button
    } from '@appwrite.io/pink-svelte';
    import { IconViewBoards, IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
    import { goto } from '$app/navigation';
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
