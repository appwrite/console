<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { getSupportedColumns, type Option } from './store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isCsvImportInProgress } from '../store';
    import { CsvDisabled } from '$database/(entity)';
    import type { DatabaseType } from '$database/(entity)/helpers/terminology';

    export let showCreate = false;
    export let selectedOption: Option['name'] = null;

    $: options = getSupportedColumns(page.data.database?.type as DatabaseType);
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
            {#each options as column}
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
