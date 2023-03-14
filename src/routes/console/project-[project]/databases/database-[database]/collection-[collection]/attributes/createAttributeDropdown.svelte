<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { options } from './store';

    export let showCreateDropdown = false;

    export let selectedOption: string = null;
    export let showCreate = false;
</script>

<DropList bind:show={showCreateDropdown}>
    <slot>
        <Button
            on:click={() => (showCreateDropdown = !showCreateDropdown)}
            event="create_attribute">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create attribute</span>
        </Button>
    </slot>
    <svelte:fragment slot="list">
        {#each options as attribute}
            <DropListItem
                icon={attribute.icon}
                on:click={() => {
                    selectedOption = attribute.name;
                    showCreateDropdown = false;
                    showCreate = true;
                }}>
                {attribute.name}
            </DropListItem>
        {/each}
    </svelte:fragment>
</DropList>
