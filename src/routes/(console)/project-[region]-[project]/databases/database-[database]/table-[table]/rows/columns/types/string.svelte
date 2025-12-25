<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Layout, Link } from '@appwrite.io/pink-svelte';
    import { IconText } from '@appwrite.io/pink-icons-svelte';
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import { isSpatialType } from '../../store';

    let {
        id,
        label,
        value = $bindable(),
        array = false,
        limited = false,
        column
    }: {
        id: string;
        label: string;
        value: string | number | boolean | string[] | number[] | boolean[] | null;
        array?: boolean;
        limited?: boolean;
        column:
            | Models.ColumnString
            | Models.ColumnInteger
            | Models.ColumnFloat
            | Models.ColumnBoolean
            | Models.ColumnPoint
            | Models.ColumnLine
            | Models.ColumnPolygon;
    } = $props();

    const autofocus = $derived(limited);
    const maxlength = $derived(
        limited
            ? undefined
            : column.type === 'string'
              ? (column as Models.ColumnString).size
              : undefined
    );

    const nullable = $derived(!limited ? !column.required : false);
    const columnSize = $derived('size' in column ? column.size : 0);

    let stringValue = $state('');

    function parseValue(str: string | null): number | boolean | string | null {
        const trimmed = str?.trim() ?? null;
        if (!trimmed) return null;

        switch (column.type) {
            case 'integer': {
                const int = parseInt(trimmed, 10);
                return isNaN(int) ? null : int;
            }

            case 'double': {
                const float = parseFloat(trimmed);
                return isNaN(float) ? null : float;
            }

            case 'boolean': {
                const lower = trimmed.toLowerCase();
                if (lower === 'true' || lower === '1') return true;
                if (lower === 'false' || lower === '0') return false;
                return null;
            }
            case 'point':
            case 'linestring':
            case 'polygon':
                return trimmed;
            case 'string':
            default:
                return trimmed;
        }
    }

    $effect(() => {
        if (isSpatialType(column) && Array.isArray(value)) {
            stringValue = JSON.stringify(value);
        } else if (array && Array.isArray(value)) {
            stringValue = JSON.stringify(value, null, 2);
        } else if (value !== null && value !== undefined) {
            stringValue = String(value);
        } else {
            stringValue = '';
        }
    });

    $effect(() => {
        if (array) {
            try {
                const parsed = JSON.parse(stringValue);
                if (Array.isArray(parsed) && JSON.stringify(parsed) !== JSON.stringify(value)) {
                    value = parsed;
                }
            } catch {
                // Invalid JSON - don't update value
            }
        } else {
            const parsedValue = isSpatialType(column)
                ? JSON.parse(stringValue)
                : parseValue(stringValue);
            if (JSON.stringify(parsedValue) !== JSON.stringify(value)) {
                value = parsedValue;
            }
        }
    });

    const getPlaceholder = () => {
        if (!array) {
            switch (column.type) {
                case 'integer':
                    return 'Enter integer';
                case 'double':
                    return 'Enter number';
                case 'boolean':
                    return 'Enter true or false';
                case 'string':
                default:
                    return 'Enter string';
            }
        } else {
            switch (column.type) {
                case 'integer':
                    return 'Enter JSON array, e.g. [1, 2, 3]';
                case 'double':
                    return 'Enter JSON array, e.g. [1.5, 2.5]';
                case 'boolean':
                    return 'Enter JSON array, e.g. [true, false]';
                case 'string':
                default:
                    return 'Enter JSON array, e.g. ["item1", "item2"]';
            }
        }
    };
</script>

{#if columnSize >= 50 || array || isSpatialType(column)}
    <InputTextarea
        {id}
        {label}
        {nullable}
        {maxlength}
        {autofocus}
        bind:value={stringValue}
        required={column.required}
        placeholder={getPlaceholder()}
        leadingIcon={!limited ? IconText : undefined}>
        <Layout.Stack direction="column" alignItems="flex-start" slot="end">
            {#if array || isSpatialType(column)}
                <Link.Button on:click size="s" variant="quiet">Advanced edit</Link.Button>
            {/if}
        </Layout.Stack>
    </InputTextarea>
{:else}
    <InputText
        {id}
        {label}
        {nullable}
        {autofocus}
        {maxlength}
        bind:value={stringValue}
        placeholder="Enter string"
        required={column.required}
        leadingIcon={!limited ? IconText : undefined} />
{/if}
