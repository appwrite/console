<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

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
            data.default,
            data.array
        );
    }

    export async function updateEnum(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeEnum>
    ) {
        await sdk.forProject.databases.updateEnumAttribute(
            databaseId,
            collectionId,
            data.key,
            data.elements,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEnum>;

    $: if (data.required || data.array) {
        data.default = null;
    }

    $: options = [
        ...(data?.elements ?? []).map((element) => {
            return {
                label: element,
                value: element
            };
        }),
        !data.required &&
            !data.array && {
                label: 'NULL',
                value: null
            }
    ].filter(Boolean);
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
    disabled={data.array || data.required}
    placeholder="Select a value"
    {options}
    bind:value={data.default} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
