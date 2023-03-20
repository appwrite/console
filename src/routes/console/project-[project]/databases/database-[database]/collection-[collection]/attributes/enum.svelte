<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitEnum(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEnum>
    ) {
        await sdk.forProject.databases.createEnumAttribute(
            databaseId,
            collectionId,
            key,
            data.elements,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }

    export async function updateEnum(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeEnum>
    ) {
        await sdkForProject.databases.createEnumAttribute(
            databaseId,
            collectionId,
            data.key,
            data.elements,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEnum>;

    $: options =
        data.elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputTags
    id="elements"
    label="Elements"
    bind:tags={data.elements}
    placeholder="Add elements here"
    required />
<InputSelect
    id="default"
    label="Default value"
    bind:options
    bind:value={data.default}
    disabled={data.required} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
