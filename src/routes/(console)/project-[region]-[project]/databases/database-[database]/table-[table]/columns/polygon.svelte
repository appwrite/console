<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitPolygon(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnPoint>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createPolygonColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: data?.default
        });
    }
    export async function updatePolygon(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnPoint>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updatePolygonColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data?.default,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import { Selector, Typography, Layout, Icon } from '@appwrite.io/pink-svelte';
    import { InputPolygon } from '$lib/elements/forms';
    import { getDefaultSpatialData } from '../store';
    import {Button} from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: Partial<Models.ColumnPoint> = {
        required: false,
        default: null
    };

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
        }
    }

    function pushCoordinate(ringIndex: number) {
        const ring = data.default?.at(ringIndex);
        if (!ring) return;

        const newPoint = getDefaultSpatialData('point') as number[];
        ring.splice(ring.length - 1, 0, newPoint);
        ring[ring.length - 1] = [...ring[0]];
        data.default = [...(data.default || [])];
    }

    function pushLine() {
        const p1 = getDefaultSpatialData('point') as number[];
        const p2 = getDefaultSpatialData('point') as number[];
        const p3 = getDefaultSpatialData('point') as number[];
        const ring = [p1, p2, p3, [...p1]];
        data.default = [...(data.default || []), ring];
    }

    function deleteCoordinate(ringIndex: number) {
        const ring = data.default?.at(ringIndex);
        if (!ring || ring.length <= 4) return;

        ring.splice(ring.length - 2, 1);
        ring[ring.length - 1] = [...ring[0]];
        data.default = [...(data.default || [])];
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnPoint>>({
        required: false,
        ...data
    });

    function handleAddDefault(){
        data.default = getDefaultSpatialData("polygon") as number[][][];
    }

    $: listen(data);

    $: handleDefaultState($required);

    $: showDefaultPointDummyData = $required ? true : false;
</script>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />

<Layout.Stack gap="xl">
    <Layout.Stack direction="row"  gap="s" alignItems="center" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-600">Default</Typography.Text>
            <Typography.Caption variant="400">Optional</Typography.Caption>
        </Layout.Stack>
        {#if !data.default}
            <Button secondary on:click={handleAddDefault}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add Polygon
            </Button>
        {/if}
    </Layout.Stack>
    <InputPolygon
        values={data.default}
        nullable={showDefaultPointDummyData}
        onAddLine={pushLine}
        onAddPoint={pushCoordinate}
        onDeletePoint={deleteCoordinate}
        onChangePoint={(lineIndex, pointIndex, coordIndex, newValue) => {
            if (data.default && data.default[lineIndex] && data.default[lineIndex][pointIndex]) {
                data.default[lineIndex][pointIndex][coordIndex] = newValue;
                // Trigger reactivity by reassigning
                data.default = [...data.default];
            }
        }} />
</Layout.Stack>
