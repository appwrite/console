<script lang="ts">
    import { InputLine } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
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

    $: nullable = !limited ? !column.required : false;

    $: value = nullable ? null : defaultData;

    $: console.log({ name: column.key, column, nullable });
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-500">{label}</Typography.Text>
        {#if nullable}
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary"
                >optional</Typography.Text>
        {/if}
    </Layout.Stack>
    <InputLine values={value || defaultData} {nullable} {onAddPoint} {onDeletePoint} />
</Layout.Stack>
