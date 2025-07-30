<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Column from './column.svelte';
    import type { Columns } from '../store';

    export let column: Columns;
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

    function getColumnType(column: Columns) {
        if ('format' in column) {
            switch (column.format) {
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
        return `${capitalize(column.type)}${column.array ? '[]' : ''}`;
    }
</script>

{#if column.array}
    {#if formValues[column.key]?.length === 0}
        <Layout.Stack direction="row" alignContent="space-between">
            <Layout.Stack gap="xxs" direction="row" alignItems="center">
                <Typography.Text variant="m-500">{label}</Typography.Text>
                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                    {getColumnType(column)}
                </Typography.Text>
            </Layout.Stack>
            <Button secondary on:click={() => addArrayItem(column.key)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add item
            </Button>
        </Layout.Stack>
    {:else}
        <Layout.Stack>
            {#each [...(formValues[column.key]?.keys() ?? [])] as index}
                <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                    <Column
                        {column}
                        id={`${column.key}-${index}`}
                        optionalText={index === 0 ? getColumnType(column) : undefined}
                        label={index === 0 ? label : ''}
                        bind:value={formValues[column.key][index]} />
                    <Button text icon on:click={() => removeArrayItem(column.key, index)}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </Button>
                </Layout.Stack>
            {/each}
            <div>
                <Button secondary on:click={() => addArrayItem(column.key)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add item
                </Button>
            </div>
        </Layout.Stack>
    {/if}
{:else}
    <Column
        {label}
        {editing}
        {column}
        id={column.key}
        optionalText={getColumnType(column)}
        bind:value={formValues[column.key]} />
{/if}
