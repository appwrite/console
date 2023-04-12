<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import Boolean from './attributes/boolean.svelte';
    import Datetime from './attributes/datetime.svelte';
    import Enum from './attributes/enum.svelte';
    import Integer from './attributes/integer.svelte';
    import Relationship from './attributes/relationship.svelte';
    import String from './attributes/string.svelte';
    import Url from './attributes/url.svelte';

    export let id: string;
    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let value: string | number | boolean | null | string[];
    export let editing = false;
    export let attribute:
        | Models.AttributeBoolean
        | Models.AttributeEmail
        | Models.AttributeEnum
        | Models.AttributeFloat
        | Models.AttributeInteger
        | Models.AttributeIp
        | Models.AttributeString
        | Models.AttributeDatetime
        | Models.AttributeUrl;

    const attributesTypeMap = {
        string: String,
        integer: Integer,
        double: Integer,
        boolean: Boolean,
        datetime: Datetime,
        relationship: Relationship
    };

    const attributesFormatMap = {
        ip: String,
        url: Url,
        email: String,
        enum: Enum
    };
</script>

{#if attribute.type in attributesTypeMap}
    {#if 'format' in attribute && attribute.format}
        <svelte:component
            this={attributesFormatMap[attribute.format]}
            {id}
            {label}
            {attribute}
            {optionalText}
            bind:value />
    {:else}
        <svelte:component
            this={attributesTypeMap[attribute.type]}
            {id}
            {editing}
            {label}
            {attribute}
            {optionalText}
            bind:value />
    {/if}
{/if}
