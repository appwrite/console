<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { getDefaultSpatialData } from '../../../store';
    import InputPolygon from '$lib/elements/forms/inputPolygon.svelte';

    export let id: string;
    export let label: string;
    export let value: number[][][];
    export let limited: boolean = false;
    export let column: Models.ColumnPolygon;

    function pushCoordinate(ringIndex: number) {
        if (!value) return;

        const ring = value.at(ringIndex);
        if (!ring) return;

        const newPoint = getDefaultSpatialData('point') as number[];
        ring.splice(ring.length - 1, 0, newPoint);
        ring[ring.length - 1] = [...ring[0]];
        value = [...value];
    }

    function pushLine() {
        if (!value) return;

        const p1 = getDefaultSpatialData('point') as number[];
        const p2 = getDefaultSpatialData('point') as number[];
        const p3 = getDefaultSpatialData('point') as number[];
        const ring = [p1, p2, p3, [...p1]];
        value = [...value, ring];
    }

    function deleteCoordinate(ringIndex: number) {
        if (!value) return;

        const ring = value.at(ringIndex);

        ring.splice(ring.length - 1, 1);
        if (ring.length === 0) {
            value.splice(ringIndex, 1);
        }
        value = [...value];
    }

    function handlePointChange(
        lineIndex: number,
        pointIndex: number,
        coordIndex: number,
        newValue: number
    ) {
        if (value && value[lineIndex] && value[lineIndex][pointIndex]) {
            value[lineIndex][pointIndex][coordIndex] = newValue;
            value = [...value];
        }
    }

    function handleAddDefault(){
        value = getDefaultSpatialData("polygon") as number[][][];
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
                    Polygon
                {/if}
            </Typography.Text>
        </Layout.Stack>
        {#if !value}
            <Button secondary on:click={handleAddDefault}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add Polygon
            </Button>
        {/if}
    </Layout.Stack>
    <InputPolygon
        values={value}
        nullable={false}
        onAddLine={pushLine}
        onAddPoint={pushCoordinate}
        onDeletePoint={deleteCoordinate}
        onChangePoint={handlePointChange} />
</Layout.Stack>
