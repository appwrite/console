<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitBoolean(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeBoolean>
    ) {
        await sdkForProject.databases.createBooleanAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }
    export async function updateBoolean(
        databaseId: string,
        collectionId: string,

        data: Partial<Models.AttributeBoolean>
    ) {
        await sdkForProject.databases.createBooleanAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect } from '$lib/elements/forms';

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

<InputSelect
    id="default"
    label="Default value"
    placeholder="Select a value"
    options={[
        { label: 'Select a value', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
    ]}
    bind:value={data.default}
    disabled={data.array || data.required} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
