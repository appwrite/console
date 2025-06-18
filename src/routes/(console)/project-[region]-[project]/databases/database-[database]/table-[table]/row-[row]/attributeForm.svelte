<script lang="ts">
    import CustomId from '$lib/components/customId.svelte';
    import { Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import type { Attributes } from '../store';
    import AttributeItem from './attributeItem.svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';

    export let attributes: Attributes[] = [];
    export let formValues: object = {};
    export let customId: string | null | undefined = undefined;

    let showCustomId = false;
</script>

{#if attributes.length}
    <Layout.Stack>
        {#each attributes as attribute}
            {@const label = attribute.key}
            <AttributeItem {attribute} bind:formValues {label} />
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
