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
    import { Selector, Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { InputLine } from '$lib/elements/forms';
    import { getDefaultSpatialData } from '../store';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: Partial<Models.ColumnLine> = {
        required: false,
        default: null
    };
    export let editing = false;

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;
    let defaultLineAdded = false;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
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

    function handleAddDefault() {
        defaultLineAdded = true;
        data.default = getDefaultSpatialData('linestring') as number[][];
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

<Layout.Stack>
    <Layout.Stack direction="row" gap="s" alignItems="center" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-600">Default</Typography.Text>
            <Typography.Caption variant="400">Optional</Typography.Caption>
        </Layout.Stack>
        {#if !data.default && ((!editing && !defaultLineAdded) || (editing && !showDefaultPointDummyData))}
            <Button secondary on:click={handleAddDefault}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add Line
            </Button>
        {/if}
    </Layout.Stack>
    <InputLine
        values={defaultLineAdded && showDefaultPointDummyData
            ? getDefaultSpatialData('point')
            : data.default}
        onAddPoint={pushCoordinate}
        nullable={defaultLineAdded && showDefaultPointDummyData}
        onDeletePoint={deleteCoordinate}
        onChangePoint={(pointIndex, coordIndex, newValue) => {
            if (data.default && data.default[pointIndex]) {
                data.default[pointIndex][coordIndex] = newValue;
            }
        }} />
</Layout.Stack>
