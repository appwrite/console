<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import Boolean from './types/boolean.svelte';
    import Datetime from './types/datetime.svelte';
    import Enum from './types/enum.svelte';
    import Integer from './types/integer.svelte';
    import Relationship from './types/relationship.svelte';
    import String from './types/string.svelte';
    import Url from './types/url.svelte';
    import Point from './types/point.svelte';
    import Line from './types/line.svelte';
    import Polygon from './types/polygon.svelte';

    export let id: string;
    export let label: string;
    export let array: boolean | undefined = undefined;
    export let optionalText: string | undefined = undefined;
    export let value: string | number | boolean | null | string[];
    export let editing = false;
    export let limited = false;
    export let column:
        | Models.ColumnBoolean
        | Models.ColumnEmail
        | Models.ColumnEnum
        | Models.ColumnFloat
        | Models.ColumnInteger
        | Models.ColumnIp
        | Models.ColumnString
        | Models.ColumnDatetime
        | Models.ColumnUrl
        | Models.ColumnPoint
        | Models.ColumnLine
        | Models.ColumnPolygon;

    const columnsTypeMap = {
        string: String,
        integer: Integer,
        double: Integer,
        boolean: Boolean,
        datetime: Datetime,
        relationship: Relationship,
        point: Point,
        linestring: Line,
        polygon: Polygon
    };

    const columnsFormatMap = {
        ip: String,
        url: Url,
        email: String,
        enum: Enum
    };
</script>

{#if column.type in columnsTypeMap}
    {#if 'format' in column && column.format}
        <!-- the `on:click` is from string > array mode for advanced edit button -->
        <svelte:component
            this={columnsFormatMap[column.format]}
            {id}
            {label}
            {column}
            {limited}
            {array}
            {optionalText}
            on:click
            bind:value />
    {:else}
        <!-- the `on:click` is from string > array mode for advanced edit button -->
        <svelte:component
            this={column.array ? columnsTypeMap['string'] : columnsTypeMap[column.type]}
            {id}
            {editing}
            {limited}
            {label}
            {column}
            {array}
            {optionalText}
            on:click
            bind:value />
    {/if}
{/if}
