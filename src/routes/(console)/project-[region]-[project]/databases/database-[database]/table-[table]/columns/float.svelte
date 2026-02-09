<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { toNumberOrNull } from '$lib/helpers/numbers';

    export async function submitFloat(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnFloat>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createFloatColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            min: toNumberOrNull(data.min),
            max: toNumberOrNull(data.max),
            xdefault: toNumberOrNull(data.default),
            array: data.array
        });
    }

    export async function updateFloat(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnFloat>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateFloatColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: toNumberOrNull(data.default),
            min: toNumberOrNull(data.min),
            max: toNumberOrNull(data.max),
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputNumber } from '$lib/elements/forms';
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

    export let editing = false;
    export let disabled = false;
    export let data: Partial<Models.ColumnFloat> = {
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
    } = createConservative<Partial<Models.ColumnFloat>>({
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
        placeholder="Enter size"
        bind:value={data.min}
        step="any"
        {disabled}
        required={editing} />

    <InputNumber
        id="max"
        label="Max"
        placeholder="Enter size"
        bind:value={data.max}
        step="any"
        {disabled}
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
    nullable={!data.required && !data.array}
    step="any" />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
