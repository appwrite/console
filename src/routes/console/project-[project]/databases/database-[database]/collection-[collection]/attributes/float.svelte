<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitFloat(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeFloat>
    ) {
        await sdk.forProject.databases.createFloatAttribute(
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

    export async function updateFloat(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeFloat>
    ) {
        await sdk.forProject.databases.createFloatAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.min,
            data.max,
            typeof data.default === 'number' ? data.default : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputNumber, InputChoice } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeFloat> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputNumber id="min" label="Min" bind:value={data.min} />
<InputNumber id="max" label="Max" bind:value={data.max} />

<InputNumber
    id="default"
    label="Default value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array}
    step="any" />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
