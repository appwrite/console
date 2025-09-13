<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { getDefaultSpatialData, getSingleRingPolygon } from '../../../store';
    import InputPolygon from '$lib/elements/forms/inputPolygon.svelte';

    interface Props {
        label: string;
        value: number[][][];
        limited: boolean;
        column: Models.ColumnPolygon;
    }

    let { label, value = $bindable(), limited = false, column }: Props = $props();

    function pushCoordinate(ringIndex: number) {
        const ring = value[ringIndex];
        if (!ring) return;

        const newPoint = getDefaultSpatialData('point') as number[];

        const newRing = [...ring];
        newRing.splice(newRing.length - 1, 0, newPoint);
        newRing[newRing.length - 1] = [...newRing[0]];

        value = value.map((r, i) => (i === ringIndex ? newRing : r));
    }

    function pushLine() {
        if (!value) return;
        value = [...value, getSingleRingPolygon()];
    }

    function deleteCoordinate(ringIndex: number) {
        if (!value) return;

        value = value
            .map((ring, i) => (i === ringIndex ? ring.slice(0, -1) : ring))
            .filter((ring) => ring.length > 0);
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

    function handleAddDefault() {
        value = getDefaultSpatialData('polygon') as number[][][];
    }

    const nullable = $derived(!limited ? !column.required : false);
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
