<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';

    export async function submitBoolean(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeBoolean>
    ) {
        await sdk.forProject.databases.createBooleanAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default ? data.default : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect } from '$lib/elements/forms';

    export let selectedAttribute: Models.AttributeBoolean = null;
    export let data: Partial<Models.AttributeBoolean> = {
        required: false,
        array: false,
        default: null
    };

    $: if (selectedAttribute) {
        data.required = selectedAttribute.required;
        data.array = selectedAttribute.array;
        data.default = selectedAttribute.default;
    }

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
    disabled={!!selectedAttribute || data.array || data.required} />
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
