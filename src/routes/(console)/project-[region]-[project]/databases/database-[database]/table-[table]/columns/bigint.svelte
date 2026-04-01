<script module lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

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
            xdefault: data.default,
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
            xdefault: data.default,
            min: data.min,
            max: data.max,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputText } from '$lib/elements/forms';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

    type Props = {
        editing?: boolean;
        disabled?: boolean;
        data?: Partial<Models.ColumnBigint>;
    };

    let {
        editing = false,
        disabled = false,
        data = $bindable({ required: false, array: false })
    }: Props = $props();

    let savedDefault = data.default;
    let minString = $state(data.min?.toString() ?? '');
    let maxString = $state(data.max?.toString() ?? '');
    let defaultString = $state(data.default?.toString() ?? '');

    let minError = $state<string | null>(null);
    let maxError = $state<string | null>(null);
    let defaultError = $state<string | null>(null);

    let prevHideDefault = $state<boolean | null>(null);
    let lastWrittenMin: Models.ColumnBigint['min'] = undefined;
    let lastWrittenMax: Models.ColumnBigint['max'] = undefined;
    let lastWrittenDefault: Models.ColumnBigint['default'] = undefined;

    function parseBigintString(str: string): bigint | null {
        const trimmed = str.trim();
        console.log({ trimmed });
        if (!trimmed) return null;
        try {
            return BigInt(trimmed);
        } catch {
            return null;
        }
    }

    $effect(() => {
        // Keep all writes to `data` in a single effect to avoid
        // effect-update-depth loops from multiple effects ping-ponging.
        const hideDefault = !!data.required || !!data.array;

        // Only toggle default visibility on transitions.
        if (prevHideDefault === null || prevHideDefault !== hideDefault) {
            if (hideDefault) {
                // Capture current default once, then clear.
                savedDefault = data.default;
                data.default = null;
                defaultString = '';
                lastWrittenDefault = null;
            } else {
                // Restore (if any) and update the input text.
                data.default = savedDefault;
                defaultString = savedDefault?.toString() ?? '';
                lastWrittenDefault = savedDefault as Models.ColumnBigint['default'];
            }
            prevHideDefault = hideDefault;
        }

        const parsedMin = parseBigintString(minString);
        minError = minString.trim() && parsedMin === null ? 'Invalid integer' : null;
        if (parsedMin !== null || !minString.trim()) {
            const next = parsedMin as unknown as Models.ColumnBigint['min'];
            if (next !== lastWrittenMin) {
                data.min = next;
                lastWrittenMin = next;
            }
        }

        const parsedMax = parseBigintString(maxString);
        console.log({ parsedMax });
        maxError = maxString.trim() && parsedMax === null ? 'Invalid integer' : null;
        if (parsedMax !== null || !maxString.trim()) {
            const next = parsedMax as unknown as Models.ColumnBigint['max'];
            if (next !== lastWrittenMax) {
                data.max = next;
                lastWrittenMax = next;
            }
        }

        // Default is disabled when required or array is enabled.
        if (!hideDefault) {
            const parsedDefault = parseBigintString(defaultString);
            defaultError =
                defaultString.trim() && parsedDefault === null ? 'Invalid integer' : null;
            if (parsedDefault !== null || !defaultString.trim()) {
                const next = parsedDefault as unknown as Models.ColumnBigint['default'];
                if (next !== lastWrittenDefault) {
                    data.default = next;
                    lastWrittenDefault = next;
                }
            }
        } else {
            defaultError = null;
        }
    });
</script>

<Layout.Stack direction="row" gap="s">
    <InputText
        id="min"
        label="Min"
        {disabled}
        placeholder="Enter integer"
        pattern="^-?[0-9]+$"
        patternError="Invalid integer"
        helper={minError ?? undefined}
        bind:value={minString}
        required={editing} />

    <InputText
        id="max"
        label="Max"
        {disabled}
        placeholder="Enter integer"
        pattern="^-?[0-9]+$"
        patternError="Invalid integer"
        helper={maxError ?? undefined}
        bind:value={maxString}
        required={editing} />
</Layout.Stack>

<InputText
    id="default"
    label="Default value"
    placeholder="Enter integer"
    pattern="^-?[0-9]+$"
    patternError="Invalid integer"
    helper={defaultError ?? undefined}
    bind:value={defaultString}
    disabled={data.required || data.array || disabled}
    nullable={(!data.required && !data.array) || disabled} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
