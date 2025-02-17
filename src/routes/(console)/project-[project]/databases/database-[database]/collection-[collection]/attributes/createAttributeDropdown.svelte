<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { attributeOptions, type Option } from './store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let showCreateDropdown = false;

    export let selectedOption: Option['name'] = null;
    export let showCreate = false;
</script>

<DropList bind:show={showCreateDropdown} scrollable>
    <slot>
        <Button
            on:click={() => (showCreateDropdown = !showCreateDropdown)}
            event="create_attribute">
            <Icon icon={IconPlus} slot="start" size="s" />
            Create attribute
        </Button>
    </slot>
    <svelte:fragment slot="list">
        {#each attributeOptions as attribute}
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
