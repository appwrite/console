<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import Boolean from './columns/boolean.svelte';
    import Datetime from './columns/datetime.svelte';
    import Enum from './columns/enum.svelte';
    import Integer from './columns/integer.svelte';
    import Relationship from './columns/relationship.svelte';
    import String from './columns/string.svelte';
    import Url from './columns/url.svelte';

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
        | Models.ColumnUrl;

    const columnsTypeMap = {
        string: String,
        integer: Integer,
        double: Integer,
        boolean: Boolean,
        datetime: Datetime,
        relationship: Relationship
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
        <svelte:component
            this={columnsFormatMap[column.format]}
            {id}
            {label}
            {column}
            {limited}
            {array}
            {optionalText}
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
