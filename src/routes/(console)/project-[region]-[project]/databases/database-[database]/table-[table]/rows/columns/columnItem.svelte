<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Column from './column.svelte';
    import type { Columns } from '../../store';
    import { writable } from 'svelte/store';

    let {
        column,
        formValues = $bindable({}),
        label,
        editing = false,
        fromSpreadsheet = false,
        onUpdateFormValues = null
    }: {
        column: Columns;
        formValues: object;
        label: string;
        editing?: boolean;
        fromSpreadsheet?: boolean;
        onUpdateFormValues?: (formValues: object) => void;
    } = $props();

    let formStore = writable(formValues);

    function removeArrayItem(key: string, index: number) {
        const next = {
            ...$formStore,
            [key]: $formStore[key].filter((_, i) => i !== index)
        };

        formStore.set(next);
        onUpdateFormValues?.(next);
    }

    function addArrayItem(key: string) {
        const next = {
            ...$formStore,
            [key]: [...($formStore[key] ?? []), null]
        };

        formStore.set(next);
        onUpdateFormValues?.(next);
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

    formStore.subscribe((values) => onUpdateFormValues?.(values));
</script>

{#if column.array}
    {#if $formStore[column.key]?.length === 0}
        {#if fromSpreadsheet}
            <Column
                array
                {label}
                {column}
                {editing}
                id={column.key}
                limited={fromSpreadsheet}
                optionalText={getColumnType(column)}
                bind:value={$formStore[column.key]}
                on:click />
        {:else}
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
        {/if}
    {:else if fromSpreadsheet}
        <Column
            array
            {label}
            {column}
            {editing}
            id={column.key}
            limited={fromSpreadsheet}
            optionalText={getColumnType(column)}
            bind:value={$formStore[column.key]}
            on:click />
    {:else}
        <Layout.Stack>
            {#each [...($formStore[column.key]?.keys() ?? [])] as index}
                <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                    <Column
                        {column}
                        limited={fromSpreadsheet}
                        id={`${column.key}-${index}`}
                        optionalText={index === 0 ? getColumnType(column) : undefined}
                        label={index === 0 ? label : ''}
                        bind:value={$formStore[column.key][index]} />
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
        limited={fromSpreadsheet}
        optionalText={getColumnType(column)}
        bind:value={$formStore[column.key]}
        on:click />
{/if}
