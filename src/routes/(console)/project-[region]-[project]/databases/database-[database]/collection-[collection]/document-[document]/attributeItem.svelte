<script lang="ts">
    import { Button, FormList } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import type { Attributes } from '../store';
    import Attribute from './attribute.svelte';

    export let attribute: Attributes;
    export let formValues: object = {};
    export let label: string;
    export let editing = false;

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

    function getAttributeType(attribute: Attributes) {
        if ('format' in attribute) {
            switch (attribute.format) {
                case 'ip':
                    return 'IP';
                case 'email':
                    return 'Email';
                case 'url':
                    return 'URL';
                case 'enum':
                    return 'Enum';
                default:
                    'String';
                    break;
            }
        }
        return `${capitalize(attribute.type)}${attribute.array ? '[]' : ''}`;
    }
</script>

{#if attribute.array}
    {#if formValues[attribute.key]?.length === 0}
        <div class="u-flex u-cross-center u-main-space-between">
            <span class="label u-margin-0">
                {label}
                <span class="optional u-margin-inline-start-8">
                    {getAttributeType(attribute)}
                </span>
            </span>
            <Button text noMargin on:click={() => addArrayItem(attribute.key)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add item</span>
            </Button>
        </div>
    {:else}
        <ul class="u-grid u-gap-4">
            {#each [...formValues[attribute.key].keys()] as index}
                <li class="form-item is-multiple u-gap-8">
                    <div class="form-item-part u-stretch">
                        <Attribute
                            {attribute}
                            id={`${attribute.key}-${index}`}
                            optionalText={index === 0 ? getAttributeType(attribute) : undefined}
                            label={index === 0 ? label : ''}
                            bind:value={formValues[attribute.key][index]} />
                    </div>
                    <div class="form-item-part u-cross-child-end">
                        <Button
                            noMargin
                            text
                            round
                            on:click={() => removeArrayItem(attribute.key, index)}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </div>
                </li>
            {/each}
            <Button text noMargin on:click={() => addArrayItem(attribute.key)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text"> Add item</span>
            </Button>
        </ul>
    {/if}
{:else}
    <FormList>
        <Attribute
            {editing}
            {attribute}
            {label}
            optionalText={getAttributeType(attribute)}
            id={attribute.key}
            bind:value={formValues[attribute.key]} />
    </FormList>
{/if}
