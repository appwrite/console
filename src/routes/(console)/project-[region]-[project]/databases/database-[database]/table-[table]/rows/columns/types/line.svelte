<script lang="ts">
    import { InputLine } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getDefaultSpatialData } from '../../../store';

    export let id: string;
    export let label: string;
    export let value: number[][];
    export let limited: boolean = false;
    export let column: Models.ColumnLine;

    const defaultData = getDefaultSpatialData('linestring') as number[][];
    function onAddPoint() {
        value = [...(value || defaultData), getDefaultSpatialData('point') as number[]];
    }

    function onDeletePoint() {
        if (value && value?.length > 2) value = value.slice(0, value.length - 1);
    }

    function handlePointChange(pointIndex: number, coordIndex: number, newValue: number) {
        if (value && value[pointIndex]) {
            value[pointIndex][coordIndex] = newValue;
        }
    }

    function handleAddDefault() {
        value = getDefaultSpatialData('linestring') as number[][];
    }

    $: nullable = !limited ? !column.required : false;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack direction="row" alignItems="center" gap="s">
            <Typography.Text variant="m-500">{label}</Typography.Text>
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                {#if nullable}
                    optional
                {:else}
                    Line
                {/if}
            </Typography.Text>
        </Layout.Stack>
        {#if !value}
            <Button secondary on:click={handleAddDefault}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add Line
            </Button>
        {/if}
    </Layout.Stack>
    <InputLine
        values={value}
        nullable={false}
        {onAddPoint}
        {onDeletePoint}
        onChangePoint={handlePointChange} />
</Layout.Stack>
