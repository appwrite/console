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
            stringValue = value.map(String).join(', ');
        } else if (value !== null && value !== undefined) {
            stringValue = String(value);
        } else {
            stringValue = '';
        }
    });

    $effect(() => {
        if (array) {
            const newArray = stringValue
                .split(',')
                .map((item) => parseValue(item))
                .filter((item) => item !== null);
            if (JSON.stringify(newArray) !== JSON.stringify(value)) {
                value = newArray as string[] | number[] | boolean[];
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
                    return 'Enter integers separated by commas';
                case 'double':
                    return 'Enter numbers separated by commas';
                case 'boolean':
                    return 'Enter true/false separated by commas';
                case 'string':
                default:
                    return 'Enter strings separated by commas';
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
