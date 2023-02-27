<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { DropList } from '.';

    export let view = 'grid';

    let showSelectColumns = false;
</script>

<DropList bind:show={showSelectColumns} scrollable={true}>
    <Button secondary on:click={() => (showSelectColumns = true)}>
        <span class="icon-view-board" />
        <span class="text">Columns</span>
    </Button>
    <svelte:fragment slot="other">
        <slot />
    </svelte:fragment>
</DropList>

<ul class="buttons-list">
    <li class="buttons-list-item">
        <Button text disabled={view === 'list'} on:click={() => (view = 'list')}>
            <span class="icon-view-list" />
        </Button>
    </li>
    <li class="buttons-list-item">
        <Button text disabled={view === 'grid'} on:click={() => (view = 'grid')}>
            <span class="icon-view-grid" />
        </Button>
    </li>
</ul>
