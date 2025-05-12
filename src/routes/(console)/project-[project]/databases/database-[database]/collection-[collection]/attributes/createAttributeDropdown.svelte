<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { attributeOptions, type Option } from './store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import CsvDisabled from '../csvDisabled.svelte';
    import { isCsvImportInProgress } from '../store';

    export let selectedOption: Option['name'] = null;
    export let showCreate = false;
</script>

{#if $isCsvImportInProgress}
    <CsvDisabled>
        <Button size="s" disabled>
            <Icon icon={IconPlus} slot="start" size="s" />
            Create attribute
        </Button>
    </CsvDisabled>
{:else}
    <Popover let:toggle padding="none" placement="bottom-start">
        <slot {toggle}>
            <Button on:click={toggle} event="create_attribute">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create attribute
            </Button>
        </slot>
        <ActionMenu.Root slot="tooltip">
            {#each attributeOptions as attribute}
                <ActionMenu.Item.Button
                    leadingIcon={attribute.icon}
                    on:click={() => {
                        selectedOption = attribute.name;
                        showCreate = true;
                    }}>
                    {attribute.name}
                </ActionMenu.Item.Button>
            {/each}
        </ActionMenu.Root>
    </Popover>
{/if}
