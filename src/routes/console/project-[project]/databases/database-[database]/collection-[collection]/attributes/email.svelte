<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';

    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitEmail(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEmail>
    ) {
        await sdkForProject.databases.createEmailAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }

    export async function updateEmail(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeEmail>
    ) {
        await sdkForProject.databases.createEmailAttribute(
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
    import { InputChoice, InputEmail } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEmail>;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputEmail id="default" label="Default value" bind:value={data.default} disabled={data.required} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
