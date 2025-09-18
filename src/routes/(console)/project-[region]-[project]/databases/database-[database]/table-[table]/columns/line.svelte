<script module lang="ts">
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

    interface Props {
        data?: Partial<Models.ColumnLine>;
        editing?: boolean;
    }

    let { data = { required: false, default: null }, editing = false }: Props = $props();

    let savedDefault = $state(data.default);
    let defaultChecked = $state(!!data.default);

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault ?? getDefaultSpatialData('linestring');
        }
    }

    function pushCoordinate() {
        if (data.default) {
            data.default.push(getDefaultSpatialData('point') as number[]);
            data.default = [...data.default];
        }
    }

    function deleteCoordinate(_: number) {
        if (data.default && data.default.length > 2) {
            data.default.pop();
            data.default = [...data.default];
        }
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnLine>>({
        required: false,
        ...data
    });

    $effect(() => {
        listen(data);
    });

    $effect(() => {
        data.required = $required;
        if ($required) {
            handleDefaultState(true);
        }
    });

    onMount(() => {
        if (!editing) {
            savedDefault = getDefaultSpatialData('linestring');
            defaultChecked = false;
            $required = false;
        }
    });
</script>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={$required}
    on:change={(e) => {
        if (e.detail) defaultChecked = false;
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

<Layout.Stack>
    {#if defaultChecked}
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-600">Default</Typography.Text>
            <Typography.Caption variant="400">Optional</Typography.Caption>
        </Layout.Stack>
    {/if}
    <InputLine
        values={defaultChecked ? data.default : null}
        onAddPoint={() => pushCoordinate()}
        onDeletePoint={deleteCoordinate}
        onChangePoint={(pointIndex: number, coordIndex: number, newValue: number) => {
            if (data.default) {
                data.default[pointIndex][coordIndex] = newValue;
                data.default = [...data.default];
            }
        }} />
</Layout.Stack>
