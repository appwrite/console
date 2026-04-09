<script module lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    
    function normalizeBigInt(value) {
        if (value === undefined) return undefined;
        if (value === null) return null;
        return BigInt(value);
    }

    export async function submitBigInt(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnBigint>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createBigIntColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            min: data.min,
            max: data.max,
            xdefault: normalizeBigInt(data.default),
            array: data.array
        });
    }

    export async function updateBigInt(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnBigint>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateBigIntColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: normalizeBigInt(data.default),
            min: data.min,
            max: data.max,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputNumber } from '$lib/elements/forms';
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

    type Props = {
        editing?: boolean;
        disabled?: boolean;
        data?: Partial<Models.ColumnBigint>;
    };

    let {
        editing = false,
        disabled = false,
        data = $bindable({
            required: false,
            min: 0,
            max: 0,
            default: 0,
            array: false
        })
    }: Props = $props();

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
    } = createConservative<Partial<Models.ColumnBigint>>({
        required: false,
        array: false,
        ...data
    });
    $effect(() => {
        listen(data);
    });

    $effect(() => {
        handleDefaultState($required || $array);
    });
</script>

<Layout.Stack direction="row" gap="s">
    <InputNumber
        id="min"
        label="Min"
        {disabled}
        placeholder="Enter size"
        bind:value={data.min as number}
        required={editing} />

    <InputNumber
        id="max"
        label="Max"
        {disabled}
        placeholder="Enter size"
        bind:value={data.max as number}
        required={editing} />
</Layout.Stack>

<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    min={data.min as number}
    max={data.max as number}
    bind:value={data.default as number}
    disabled={data.required || data.array || disabled}
    nullable={(!data.required && !data.array) || disabled} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
