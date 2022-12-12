<script lang="ts">
    import CustomId from '$lib/components/customId.svelte';
    import { FormList } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import Pill from '$lib/elements/pill.svelte';
    import type { Attributes } from '../store';
    import Attribute from './attribute.svelte';

    export let attributes: Attributes[] = [];
    export let formValues: object = {};
    export let customId: string | null | undefined = undefined;
    export let gap: '16' | '32' = '32';

    let showCustomId = false;

    function removeArrayItem(key: string, index: number) {
        formValues = {
            ...formValues,
            [key]: formValues[key].filter((_, i) => i !== index)
        };
    }

    function addArrayItem(key: string) {
        formValues = {
            ...formValues,
            [key]: [...formValues[key], null]
        };
    }
</script>

{#if attributes.length}
    <ul class={`form-list u-gap-${gap}`}>
        {#each attributes as attribute}
            {@const label = attribute.required ? `${attribute.key}*` : attribute.key}
            {#if attribute.array}
                {#if formValues[attribute.key].length === 0}
                    <div class="u-flex u-cross-center u-main-space-between">
                        <span class="label u-margin-0">{label}</span>
                        <Button text noMargin on:click={() => addArrayItem(attribute.key)}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text"> Add item</span>
                        </Button>
                    </div>
                {/if}

                {#each [...formValues[attribute.key].keys()] as index}
                    <li class="form-item is-multiple">
                        <div class="form-item-part u-stretch">
                            <Attribute
                                {attribute}
                                id={`${attribute.key}-${index}`}
                                label={index === 0 ? label : ''}
                                bind:value={formValues[attribute.key][index]} />
                        </div>
                        <div class="form-item-part u-cross-child-end">
                            <Button text on:click={() => removeArrayItem(attribute.key, index)}>
                                <span class="icon-x" aria-hidden="true" />
                            </Button>
                        </div>
                    </li>
                {/each}

                {#if formValues[attribute.key].length !== 0}
                    <Button text noMargin on:click={() => addArrayItem(attribute.key)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add item</span>
                    </Button>
                {/if}
            {:else}
                <FormList>
                    <Attribute
                        {attribute}
                        {label}
                        id={attribute.key}
                        bind:value={formValues[attribute.key]} />
                </FormList>
            {/if}
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
                <CustomId bind:show={showCustomId} name="Document" bind:id={customId} />
            {/if}
        {/if}
    </ul>
{/if}
