<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitString(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk.forProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            data.size,
            data.required,
            data.default,
            data.array
        );
    }
    export async function updateString(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk.forProject.databases.updateStringAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputNumber } from '$lib/elements/forms';
    import String from '../document-[document]/attributes/string.svelte';

    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false
    };
    export let editing = false;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputNumber
    id="size"
    label="Size"
    placeholder="Enter size"
    bind:value={data.size}
    required
    readonly={editing} />
<String
    id="default"
    label="Default value"
    attribute={{
        key: 'default',
        type: 'string',
        required: data.required,
        array: data.array,
        size: data.size,
        default: data.default,
        status: 'enabled'
    }}
    disabled={data.required || data.array}
    bind:value={data.default} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
