<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitDatetime(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeDatetime>
    ) {
        await sdk.forProject.databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default,
            data.array
        );
    }

    export async function updateDatetime(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeDatetime>
    ) {
        await sdk.forProject.databases.updateDatetimeAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputDateTime } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeDatetime>;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputDateTime
    id="default"
    label="Default value"
    bind:value={data.default}
    disabled={data.required || data.array} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
