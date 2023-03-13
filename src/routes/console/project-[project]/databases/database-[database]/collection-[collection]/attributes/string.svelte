<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitString(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdkForProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            data.size,
            data.required,
            data.default ? (data.default as string) : undefined,
            data.array
        );
    }
    export async function updateString(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdkForProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            data.key,
            data.size,
            data.required,
            data.default ? (data.default as string) : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputNumber, InputText, InputChoice } from '$lib/elements/forms';

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

<InputNumber id="size" label="Size" bind:value={data.size} required readonly={editing} />
<InputText
    id="default"
    label="Default value"
    bind:value={data.default}
    maxlength={data.size}
    disabled={data.required || data.array} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
