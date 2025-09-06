<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getDefaultSpatialData } from '../../../store';
    import InputPolygon from '$lib/elements/forms/inputPolygon.svelte';

    export let id: string;
    export let label: string;
    export let value: number[][][];
    export let limited: boolean = false;
    export let column: Models.ColumnPolygon;

    const defaultData = getDefaultSpatialData('polygon');

    function pushCoordinate(ringIndex: number) {
        if (!value) return;

        const ring = value.at(ringIndex);
        if (!ring) return;

        const newPoint = getDefaultSpatialData('point') as number[];
        ring.splice(ring.length - 1, 0, newPoint);
        ring[ring.length - 1] = [...ring[0]];
    }

    function pushLine() {
        if (!value) return;

        const p1 = getDefaultSpatialData('point') as number[];
        const p2 = getDefaultSpatialData('point') as number[];
        const p3 = getDefaultSpatialData('point') as number[];
        const ring = [p1, p2, p3, [...p1]];
        value.push(ring);
    }

    function deleteCoordinate(ringIndex: number) {
        if (!value) return;

        const ring = value.at(ringIndex);
        if (!ring || ring.length <= 4) return;

        ring.splice(ring.length - 2, 1);
        ring[ring.length - 1] = [...ring[0]];
    }

    function handlePointChange(
        lineIndex: number,
        pointIndex: number,
        coordIndex: number,
        newValue: number
    ) {
        if (value && value[lineIndex] && value[lineIndex][pointIndex]) {
            value[lineIndex][pointIndex][coordIndex] = newValue;
        }
    }

    $: nullable = !limited ? !column.required : false;

    $: displayValue = value || defaultData;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-500">{label}</Typography.Text>
        {#if nullable}
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary"
                >optional</Typography.Text>
        {/if}
    </Layout.Stack>
    <InputPolygon
        values={displayValue}
        {nullable}
        onAddLine={pushLine}
        onAddPoint={pushCoordinate}
        onDeletePoint={deleteCoordinate}
        onChangePoint={handlePointChange} />
</Layout.Stack>
