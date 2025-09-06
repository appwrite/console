<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitLine(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnLine>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createLineColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: data?.default
        });
    }
    export async function updateLine(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnLine>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateLineColumn({
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
    import { Selector, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { InputLine } from '$lib/elements/forms';
    import { getDefaultSpatialData } from '../store';
    import { onMount } from 'svelte';
    const defaultData = getDefaultSpatialData('linestring') as number[][];
    export let data: Partial<Models.ColumnLine> = {
        required: false,
        default: null
    };

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;
    let disableDeletePoints = false;
    onMount(() => {
        data.default = data.required ? null : defaultData;
    });

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault ?? defaultData;
        }
    }

    function pushCoordinate(_: number) {
        data.default.push(getDefaultSpatialData('point') as number[]);
    }

    function deleteCoordinate(_: number) {
        if (data.default.length > 2) data.default.pop();
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnLine>>({
        required: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required);

    $: showDefaultPointDummyData = $required ? true : false;

    $: disableDeletePoints = !data.default || data.default.length <= 2;
</script>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-600">Default</Typography.Text>
        <Typography.Caption variant="400">Optional</Typography.Caption>
    </Layout.Stack>
    <InputLine
        values={data.default || defaultData}
        onAddPoint={pushCoordinate}
        nullable={showDefaultPointDummyData}
        onDeletePoint={deleteCoordinate}
        {disableDeletePoints} />
</Layout.Stack>
