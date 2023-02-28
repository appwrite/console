<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { DropList } from '.';
    import { preferredView } from '$lib/stores/layout';

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
        <Button
            text
            disabled={$preferredView === 'list'}
            on:click={() => ($preferredView = 'list')}>
            <span class="icon-view-list" />
        </Button>
    </li>
    <li class="buttons-list-item">
        <Button
            text
            disabled={$preferredView === 'grid'}
            on:click={() => ($preferredView = 'grid')}>
            <span class="icon-view-grid" />
        </Button>
    </li>
</ul>
