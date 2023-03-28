<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitInteger(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeInteger>
    ) {
        await sdk.forProject.databases.createIntegerAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.min,
            data.max,
            typeof data.default === 'number' ? data.default : undefined,
            data.array
        );
    }

    export async function updateInteger(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeInteger>
    ) {
        await sdk.forProject.databases.updateIntegerAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.min,
            data.max,
            typeof data.default === 'number' ? data.default : undefined
        );
    }
</script>

<script lang="ts">
    import { InputNumber, InputChoice } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeInteger> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };
    export let editing = false;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputNumber id="min" label="Min" placeholder="Enter size" bind:value={data.min} />
<InputNumber id="max" label="Max" placeholder="Enter size" bind:value={data.max} />

<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
