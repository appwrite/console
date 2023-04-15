<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitBoolean(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeBoolean>
    ) {
        await sdk.forProject.databases.createBooleanAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default,
            data.array
        );
    }
    export async function updateBoolean(
        databaseId: string,
        collectionId: string,

        data: Partial<Models.AttributeBoolean>
    ) {
        await sdk.forProject.databases.updateBooleanAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice } from '$lib/elements/forms';
    import Boolean from '../document-[document]/attributes/boolean.svelte';

    export let editing = false;
    export let data: Partial<Models.AttributeBoolean> = {
        required: false,
        array: false,
        default: null
    };

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<Boolean
    id="default"
    label="Default value"
    bind:value={data.default}
    attribute={{
        key: data.key,
        required: data.required,
        status: 'enabled',
        type: 'boolean',
        array: data.array
    }}
    disabled={data.array || data.required} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
