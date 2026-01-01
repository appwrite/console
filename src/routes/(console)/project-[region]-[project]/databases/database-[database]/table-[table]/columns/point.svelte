<script module lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitPoint(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnPoint>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createPointColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: data?.default
        });
    }
    export async function updatePoint(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnPoint>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updatePointColumn({
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
    import { InputPoint } from '$lib/elements/forms';
    import { createConservative } from '$lib/helpers/stores';
    import { Selector, Typography, Layout } from '@appwrite.io/pink-svelte';
    import { getDefaultSpatialData } from '../store';
    import { onMount } from 'svelte';

    interface Props {
        editing?: boolean;
        disabled?: boolean;
        data?: Partial<Models.ColumnPoint>;
    }

    let {
        data = {
            default: null,
            required: false
        },
        editing = false,
        disabled = false
    }: Props = $props();

    let savedDefault = $state(data.default);
    let defaultChecked = $state(!!data.default);

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault ?? getDefaultSpatialData('point');
        }
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnPoint>>({
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

    $effect(() => {
        defaultChecked = data.default !== null;
    });

    onMount(() => {
        if (!editing) {
            savedDefault = getDefaultSpatialData('point');
            defaultChecked = false;
            $required = false;
        }
    });
</script>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    {disabled}
    bind:checked={$required}
    on:change={(e) => {
        if (e.detail) defaultChecked = false;
    }}
    description="Indicate whether this column is required" />

<Selector.Checkbox
    size="s"
    id="default"
    label="Default value"
    {disabled}
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

    <InputPoint
        {disabled}
        values={defaultChecked ? data.default : null}
        onChangePoint={(index, newValue) => {
            if (data.default) {
                data.default[index] = newValue;
                data.default = [...data.default];
            }
        }} />
</Layout.Stack>
