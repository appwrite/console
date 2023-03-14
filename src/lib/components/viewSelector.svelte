<script lang="ts">
    import { Button, InputChoice } from '$lib/elements/forms';
    import { DropList } from '.';
    import { prefs } from '$lib/stores/user';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { Writable } from 'svelte/store';

    type Column = {
        id: string;
        title: string;
        show: boolean;
        width?: number;
    };

    export let columns: Writable<Column[]>;
    export let showToggle = true;
    const pathname = $page.url.pathname;
    let showSelectColumns = false;

    onMount(() => {
        updateColumns();
    });

    function updateColumns() {
        if ($prefs?.[pathname]) {
            $columns.forEach((column, i) => {
                column.show = $prefs[pathname][i];
            });
            $columns = $columns;
        }
    }

    $: selectedColumnsNumber = $columns.reduce((acc, column) => {
        if (column.show) {
            acc++;
        }
        return acc;
    }, 0);

    columns.subscribe((columns) => {
        const columnsArray = columns.map((column) => column.show);
        prefs.updatePrefs({ ...$prefs, [pathname]: columnsArray });
    });
</script>

{#if $columns?.length}
    {#if $prefs?.preferredView === 'list'}
        <DropList bind:show={showSelectColumns} scrollable={true}>
            <Button secondary on:click={() => (showSelectColumns = true)}>
                <span
                    class="icon-view-boards u-opacity-50	"
                    aria-hidden="true"
                    aria-label="columns" />
                <span class="text">Columns</span>
                <span class="inline-tag">{selectedColumnsNumber}</span>
            </Button>
            <svelte:fragment slot="list">
                {#each $columns as column}
                    <InputChoice
                        id={column.id}
                        label={column.title}
                        bind:value={column.show}
                        disabled={selectedColumnsNumber <= 1 && column.show} />
                {/each}
            </svelte:fragment>
        </DropList>
    {/if}
{/if}

{#if showToggle}
    <div class="toggle-button">
        <ul class="toggle-button-list">
            <li class="toggle-button-item">
                <button
                    class="toggle-button-element"
                    aria-label="List View"
                    type="button"
                    class:is-selected={$prefs.preferredView === 'list'}
                    on:click={() => prefs.updatePrefs({ ...$prefs, preferredView: 'list' })}>
                    <span class="icon-view-list" aria-hidden="true" />
                </button>
            </li>
            <li class="toggle-button-item">
                <button
                    class="toggle-button-element"
                    aria-label="Grid View"
                    type="button"
                    class:is-selected={$prefs.preferredView === 'grid'}
                    on:click={() => prefs.updatePrefs({ ...$prefs, preferredView: 'grid' })}>
                    <span class="icon-view-grid" aria-hidden="true" />
                </button>
            </li>
        </ul>
    </div>
{/if}
