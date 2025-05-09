<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Attribute from './attribute.svelte';
    import type { Attributes } from '../store';

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
        <Layout.Stack direction="row" alignContent="space-between">
            <Layout.Stack gap="xxs" direction="row" alignItems="center">
                <Typography.Text variant="m-500">{label}</Typography.Text>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                    {getAttributeType(attribute)}
                </Typography.Text>
            </Layout.Stack>
            <Button secondary on:click={() => addArrayItem(attribute.key)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add item
            </Button>
        </Layout.Stack>
    {:else}
        <Layout.Stack>
            {#each [...formValues[attribute.key].keys()] as index}
                <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                    <Attribute
                        {attribute}
                        id={`${attribute.key}-${index}`}
                        optionalText={index === 0 ? getAttributeType(attribute) : undefined}
                        label={index === 0 ? label : ''}
                        bind:value={formValues[attribute.key][index]} />
                    <Button text icon on:click={() => removeArrayItem(attribute.key, index)}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </Button>
                </Layout.Stack>
            {/each}
            <div>
                <Button secondary on:click={() => addArrayItem(attribute.key)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add item
                </Button>
            </div>
        </Layout.Stack>
    {/if}
{:else}
    <Attribute
        {editing}
        {attribute}
        {label}
        optionalText={getAttributeType(attribute)}
        id={attribute.key}
        bind:value={formValues[attribute.key]} />
{/if}
