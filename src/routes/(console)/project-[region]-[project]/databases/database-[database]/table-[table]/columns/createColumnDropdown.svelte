<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { columnOptions, type Option } from './store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import CsvDisabled from '../csvDisabled.svelte';
    import { isCsvImportInProgress } from '../store';

    export let showCreate = false;
    export let selectedOption: Option['name'] = null;
</script>

{#if $isCsvImportInProgress}
    <CsvDisabled>
        <Button size="s" disabled>
            <Icon icon={IconPlus} slot="start" size="s" />
            Create column
        </Button>
    </CsvDisabled>
{:else}
    <Popover let:toggle padding="none" placement="bottom-start">
        <slot {toggle}>
            <Button secondary on:click={toggle} event="create_column">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create column
            </Button>
        </slot>
        <ActionMenu.Root slot="tooltip">
            {#each columnOptions as column}
                <ActionMenu.Item.Button
                    leadingIcon={column.icon}
                    on:click={() => {
                        selectedOption = column.name;
                        showCreate = true;
                    }}>
                    {column.name}
                </ActionMenu.Item.Button>
            {/each}
        </ActionMenu.Root>
    </Popover>
{/if}
