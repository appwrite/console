<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitInteger(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnInteger>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createIntegerColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            min: data.min,
            max: data.max,
            xdefault: data.default,
            array: data.array
        });
    }

    export async function updateInteger(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnInteger>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateIntegerColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data.default,
            min: Math.abs(data.min) > Number.MAX_SAFE_INTEGER ? undefined : data.min,
            max: Math.abs(data.max) > Number.MAX_SAFE_INTEGER ? undefined : data.max,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import { createConservative } from '$lib/helpers/stores';
    import { Layout, Selector } from '@appwrite.io/pink-svelte';

    export let editing = false;
    export let disabled = false;
    export let data: Partial<Models.ColumnInteger> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };

    let savedDefault = data.default;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
        }
    }

    const {
        stores: { required, array },
        listen
    } = createConservative<Partial<Models.ColumnInteger>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<Layout.Stack direction="row" gap="s">
    <InputNumber
        id="min"
        label="Min"
        {disabled}
        placeholder="Enter size"
        bind:value={data.min}
        required={editing} />

    <InputNumber
        id="max"
        label="Max"
        {disabled}
        placeholder="Enter size"
        bind:value={data.max}
        required={editing} />
</Layout.Stack>

<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array || disabled}
    nullable={(!data.required && !data.array) || disabled} />

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array || disabled}
    description="Indicate whether this column is required" />

<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing || disabled}
    description="Indicate whether this column is an array. Defaults to an empty array." />
