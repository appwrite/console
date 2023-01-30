<script lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import Boolean from './attributes/boolean.svelte';
    import Datetime from './attributes/datetime.svelte';
    import Enum from './attributes/enum.svelte';
    import Integer from './attributes/integer.svelte';
    import String from './attributes/string.svelte';
    import Url from './attributes/url.svelte';

    export let id: string;
    export let label: string;
    export let value: string | number | boolean | null;
    export let optionalText: string | undefined = undefined;
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
        datetime: Datetime
    };

    function isValidType(type: string): type is keyof typeof attributesTypeMap {
        return type in attributesTypeMap;
    }

    const attributesFormatMap = {
        ip: String,
        url: Url,
        email: String,
        enum: Enum
    };

    function isValidFormat(format: string): format is keyof typeof attributesFormatMap {
        return format in attributesFormatMap;
    }

    // TODO: Remove this any
    $: cmp = (function (): any {
        if (attribute.type in attributesTypeMap) {
            if ('format' in attribute && attribute.format && isValidFormat(attribute.format)) {
                return attributesFormatMap[attribute.format];
            } else if (isValidType(attribute.type)) {
                return attributesTypeMap[attribute.type];
            }
        }
    })();
</script>

{#if cmp}
    <svelte:component this={cmp} {id} {label} {attribute} {optionalText} bind:value />
{/if}
