<script module lang="ts">
    import { page } from '$app/state';
    import type { Columns } from '$database/store';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    function normalizeBigInt(value, field: string) {
        if (value === undefined) return undefined;
        if (value === null) return null;

        if (typeof value === 'number') {
            if (!Number.isFinite(value) || Number.isNaN(value)) {
                throw new Error(`${field} must be a finite integer`);
            }

            if (!Number.isInteger(value)) {
                throw new Error(`${field} must be an integer`);
            }
        }

        try {
            return BigInt(value);
        } catch {
            throw new Error(`${field} must be a valid integer`);
        }
    }

    export async function submitBigInt(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Columns>
    ) {
        const bigintData = data as Partial<Models.ColumnBigint>;

        await sdk.forProject(page.params.region, page.params.project).tablesDB.createBigIntColumn({
            databaseId,
            tableId,
            key,
            required: bigintData.required,
            min: normalizeBigInt(bigintData.min, 'Min'),
            max: normalizeBigInt(bigintData.max, 'Max'),
            xdefault: normalizeBigInt(bigintData.default, 'Default value'),
            array: bigintData.array
        });
    }

    export async function updateBigInt(
        databaseId: string,
        tableId: string,
        data: Partial<Columns>,
        originalKey?: string
    ) {
        const bigintData = data as Partial<Models.ColumnBigint>;

        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateBigIntColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: bigintData.required,
            xdefault: normalizeBigInt(bigintData.default, 'Default value'),
            min: normalizeBigInt(bigintData.min, 'Min'),
            max: normalizeBigInt(bigintData.max, 'Max'),
            newKey: bigintData.key !== originalKey ? bigintData.key : undefined
        });
    }
</script>

<script lang="ts">
    import { untrack } from 'svelte';
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

    // untrack: handleDefaultState reads and writes data.default, which would make
    // this effect depend on the state it writes and trigger an infinite update loop.
    $effect(() => {
        const hideDefault = $required || $array;
        untrack(() => handleDefaultState(hideDefault));
    });
</script>

<Layout.Stack direction="row" gap="s">
    <InputNumber
        id="min"
        label="Min"
        {disabled}
        placeholder="Enter size"
        step={1}
        bind:value={data.min as number}
        required={editing} />

    <InputNumber
        id="max"
        label="Max"
        {disabled}
        placeholder="Enter size"
        step={1}
        bind:value={data.max as number}
        required={editing} />
</Layout.Stack>

<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    step={1}
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
