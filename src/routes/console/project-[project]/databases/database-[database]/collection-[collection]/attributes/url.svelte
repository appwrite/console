<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitUrl(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeUrl>
    ) {
        await sdk.forProject.databases.createUrlAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default,
            data.array
        );
    }

    export async function updateUrl(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeUrl>
    ) {
        await sdk.forProject.databases.updateUrlAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputURL } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeUrl>;
    export let editing = false;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputURL
    id="default"
    label="Default value"
    placeholder="Enter value"
    bind:value={data.default}
    disabled={data.required || data.array} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
