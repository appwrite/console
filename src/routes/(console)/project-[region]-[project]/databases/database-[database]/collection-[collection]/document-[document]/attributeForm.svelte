<script lang="ts">
    import CustomId from '$lib/components/customId.svelte';
    import Pill from '$lib/elements/pill.svelte';
    import type { Attributes } from '../store';
    import AttributeItem from './attributeItem.svelte';

    export let attributes: Attributes[] = [];
    export let formValues: object = {};
    export let customId: string | null | undefined = undefined;
    export let gap: '16' | '24' | '32' = '32';

    let showCustomId = false;
</script>

{#if attributes.length}
    <ul class={`form-list u-gap-${gap}`}>
        {#each attributes as attribute}
            {@const label = attribute.key}
            <AttributeItem {attribute} bind:formValues {label} />
        {/each}

        {#if customId !== undefined}
            {#if !showCustomId}
                <div>
                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Document ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <CustomId autofocus bind:show={showCustomId} name="Document" bind:id={customId} />
            {/if}
        {/if}
    </ul>
{/if}
