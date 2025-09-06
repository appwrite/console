<script lang="ts">
    import { InputPoint } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getDefaultSpatialData } from '../../../store';

    export let id: string;
    export let label: string;
    export let value: number[];
    export let limited: boolean = false;
    export let column: Models.ColumnInteger;

    $: nullable = !limited ? !column.required : false;

    $: value = value && !nullable ? value : (getDefaultSpatialData('point') as number[]);

    function handlePointChange(index: number, newValue: number) {
        if (value) {
            value[index] = newValue;
        }
    }
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-500">{label}</Typography.Text>
        {#if nullable}
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary"
                >optional</Typography.Text>
        {/if}
    </Layout.Stack>
    <InputPoint values={value} {nullable} onChangePoint={handlePointChange} />
</Layout.Stack>
