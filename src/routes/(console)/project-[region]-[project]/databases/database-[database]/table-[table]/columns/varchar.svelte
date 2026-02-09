<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitVarchar(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnVarchar>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createVarcharColumn({
            databaseId,
            tableId,
            key,
            size: data.size,
            required: data.required,
            xdefault: data.default,
            array: data.array
        });
    }
    export async function updateVarchar(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnVarchar>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateVarcharColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data.default,
            size: data.size,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';
    import { table } from '../store';
    import { ProgressBar } from '$lib/components';
    import { Layout, Typography, Tooltip, Icon } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let data: Partial<Models.ColumnVarchar> = {
        required: false,
        size: 255,
        array: false
    };

    export let editing = false;
    export let disabled = false;

    // Local size for reactivity
    let size = data.size ?? 255;
    $: data.size = size;

    function formatBytes(bytes: number): string {
        return bytes < 1024 ? `${bytes.toLocaleString()} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
    }

    function getNewColumnBytes(s: number): number {
        return s * 4 + (s <= 255 ? 1 : 2);
    }

    function getProgressData(bytesUsed: number, bytesMax: number, s: number) {
        const newBytes = getNewColumnBytes(s);
        const exceeds = bytesUsed + newBytes > bytesMax;
        return [
            {
                size: bytesUsed,
                color: 'hsl(var(--color-information-100))',
                tooltip: {
                    title: 'Current usage:',
                    label: formatBytes(bytesUsed)
                }
            },
            {
                size: newBytes,
                color: exceeds ? 'hsl(var(--color-danger-100))' : 'hsl(var(--color-success-100))',
                tooltip: {
                    title: 'New column:',
                    label: formatBytes(newBytes)
                }
            }
        ];
    }

    $: bytesMax = $table?.bytesMax ?? 65535;
    $: bytesUsed = $table?.bytesUsed ?? 0;
    $: newColumnBytes = getNewColumnBytes(size);
    $: exceedsLimit = !editing && bytesUsed + newColumnBytes > bytesMax;

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
    } = createConservative<Partial<Models.ColumnVarchar>>({
        required: false,
        array: false,
        ...data
    });

    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputNumber
    id="size"
    label="Size"
    required
    {disabled}
    placeholder="Enter size"
    bind:value={size}
    min={1}
    max={16383} />

{#if !editing}
    <Layout.Stack gap="xs">
        <Layout.Stack direction="row" gap="xs" alignItems="center">
            <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary">
                Row size usage
            </Typography.Text>
            <Tooltip maxWidth="300px">
                <Icon icon={IconInfo} size="s" />
                <span slot="tooltip">
                    Database rows have a maximum size of 64 KB. varchar columns use 4 bytes per
                    character plus a small overhead. text, mediumtext, and longtext columns only use
                    ~20 bytes regardless of content length.
                </span>
            </Tooltip>
        </Layout.Stack>
        <ProgressBar
            hideEmptySegments
            maxSize={bytesMax}
            data={getProgressData(bytesUsed, bytesMax, size)} />
        {#if exceedsLimit}
            <Typography.Text variant="m-400" color="--fgcolor-danger">
                This column exceeds the remaining row space. Consider using text, mediumtext, or
                longtext instead.
            </Typography.Text>
        {/if}
    </Layout.Stack>
{/if}

<svelte:component
    this={size >= 50 ? InputTextarea : InputText}
    id="default"
    label="Default"
    placeholder="Enter string"
    maxlength={size}
    bind:value={data.default}
    disabled={data.required || data.array || disabled}
    nullable={!data.required && !data.array} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
