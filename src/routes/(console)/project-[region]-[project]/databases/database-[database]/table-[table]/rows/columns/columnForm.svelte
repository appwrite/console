<script lang="ts">
    import ColumnItem from './columnItem.svelte';
    import type { Columns } from '$database/store';
    import CustomId from '$lib/components/customId.svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tag } from '@appwrite.io/pink-svelte';

    let {
        columns = [],
        formValues = $bindable({}),
        customId = $bindable(undefined)
    }: {
        columns: Columns[];
        formValues: object;
        customId: string | null | undefined;
    } = $props();

    let showCustomId = $state(false);
</script>

{#if columns.length}
    <Layout.Stack>
        {#each columns as column}
            {@const label = column.key}
            <ColumnItem
                {label}
                {column}
                {formValues}
                onUpdateFormValues={(values) => (formValues = values)} />
        {/each}

        {#if customId !== undefined}
            {#if !showCustomId}
                <span>
                    <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                        <Icon icon={IconPencil} slot="start" size="s" />
                        Row ID
                    </Tag>
                </span>
            {:else}
                <CustomId autofocus bind:show={showCustomId} name="Row" bind:id={customId} />
            {/if}
        {/if}
    </Layout.Stack>
{/if}
