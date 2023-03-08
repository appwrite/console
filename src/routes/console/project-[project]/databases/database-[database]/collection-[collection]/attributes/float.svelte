<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitFloat(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeFloat>
    ) {
        await sdkForProject().databases.createFloatAttribute(
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
</script>

<script lang="ts">
    import { InputNumber, InputChoice } from '$lib/elements/forms';

    export let selectedAttribute: Models.AttributeFloat;
    export let data: Partial<Models.AttributeFloat> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };

    $: if (selectedAttribute) {
        ({
            required: data.required,
            array: data.array,
            min: data.min,
            max: data.max
        } = selectedAttribute);
        data.default = selectedAttribute.default;
    }

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputNumber id="min" label="Min" bind:value={data.min} readonly={!!selectedAttribute} />
<InputNumber id="max" label="Max" bind:value={data.max} readonly={!!selectedAttribute} />

<InputNumber
    id="default"
    label="Default value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array}
    readonly={!!selectedAttribute}
    step="any" />
<InputChoice
    id="required"
    label="Required"
    bind:value={data.required}
    disabled={!!selectedAttribute || data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice
    id="array"
    label="Array"
    bind:value={data.array}
    disabled={!!selectedAttribute || data.required}>
    Indicate whether this attribute should act as an array
</InputChoice>
