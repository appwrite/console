<script module lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitPolygon(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnPolygon>
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
        data: Partial<Models.ColumnPolygon>,
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
    import { Selector, Typography, Layout } from '@appwrite.io/pink-svelte';
    import { InputPolygon } from '$lib/elements/forms';
    import { getDefaultSpatialData, getSingleRingPolygon } from '../store';

    interface Props {
        data?: Partial<Models.ColumnPolygon>;
    }

    let { data = { required: false, default: null } }: Props = $props();

    let savedDefault = $state(data.default);
    let defaultChecked = $state(!!data.default);

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault ?? getDefaultSpatialData('polygon');
        }
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnPolygon>>({
        required: false,
        ...data
    });

    function pushCoordinate(ringIndex: number) {
        const ring = data.default?.at(ringIndex);
        if (!ring) return;

        const newPoint = getDefaultSpatialData('point') as number[];
        ring.splice(ring.length - 1, 0, newPoint);
        ring[ring.length - 1] = [...ring[0]];
        data.default = [...(data.default || [])];
    }

    function pushLine() {
        data.default = [...(data.default || []), getSingleRingPolygon()];
    }

    function deleteCoordinate(ringIndex: number) {
        const ring = data.default?.at(ringIndex);

        ring.splice(ring.length - 1, 1);
        if (ring.length === 0) {
            data.default.splice(ringIndex, 1);
        }

        data.default = [...(data.default || [])];
    }

    $effect(() => {
        listen(data);
    });

    $effect(() => {
        data.required = $required;
        handleDefaultState($required);
    });
</script>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={$required}
    on:change={(e) => {
        if (e.detail) defaultChecked = false;
        else data.default = null;
    }}
    description="Indicate whether this column is required" />

<Selector.Checkbox
    size="s"
    id="default"
    label="Default value"
    bind:checked={defaultChecked}
    on:change={(e) => {
        if (e.detail) {
            $required = false;
            handleDefaultState(false);
        } else {
            data.default = null;
        }
    }}
    description="Enable to set a predefined value for this column" />

<Layout.Stack gap="xl">
    {#if defaultChecked}
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-600">Default</Typography.Text>
            <Typography.Caption variant="400">Optional</Typography.Caption>
        </Layout.Stack>
    {/if}

    <InputPolygon
        values={defaultChecked ? data.default : null}
        onAddLine={pushLine}
        onAddPoint={pushCoordinate}
        onDeletePoint={deleteCoordinate}
        onChangePoint={(lineIndex, pointIndex, coordIndex, newValue) => {
            if (data.default && data.default[lineIndex] && data.default[lineIndex][pointIndex]) {
                data.default[lineIndex][pointIndex][coordIndex] = newValue;
                data.default = [...data.default];
            }
        }} />
</Layout.Stack>
