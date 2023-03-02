<script lang="ts">
    import { Button, InputChoice } from '$lib/elements/forms';
    import { DropList } from '.';
    import { prefs } from '$lib/stores/user';

    type Column = {
        id: string;
        name: string;
        show: boolean;
        width?: number;
    };

    let showSelectColumns = false;
    export let columns: Column[];

    $: selectedColumnsNumber = columns.reduce((acc, column) => {
        if (column.show) {
            acc++;
        }
        return acc;
    }, 0);
</script>

{#if $prefs?.preferredView === 'list'}
    <DropList bind:show={showSelectColumns} scrollable={true}>
        <Button secondary on:click={() => (showSelectColumns = true)}>
            <span class="icon-view-board" />
            <span class="text">Columns</span>
            <span class="text">{selectedColumnsNumber}</span>
        </Button>
        <svelte:fragment slot="list">
            {#each columns as column}
                <InputChoice
                    id={column.id}
                    label={column.name}
                    bind:value={column.show}
                    disabled={selectedColumnsNumber <= 1 && column.show} />
            {/each}
        </svelte:fragment>
    </DropList>
{/if}

<ul class="buttons-list">
    <li class="buttons-list-item">
        <Button
            text
            disabled={$prefs.preferredView === 'list'}
            on:click={() => prefs.updatePrefs({ ...$prefs, preferredView: 'list' })}>
            <span class="icon-view-list" />
        </Button>
    </li>
    <li class="buttons-list-item">
        <Button
            text
            disabled={$prefs.preferredView === 'grid'}
            on:click={() => {
                prefs.updatePrefs({ ...$prefs, preferredView: 'grid' });
            }}>
            <span class="icon-view-grid" />
        </Button>
    </li>
</ul>
