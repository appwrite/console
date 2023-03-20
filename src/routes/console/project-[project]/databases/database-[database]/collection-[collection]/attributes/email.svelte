<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';

    import { sdk } from '$lib/stores/sdk';

    export async function submitEmail(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEmail>
    ) {
        await sdk.forProject.databases.createEmailAttribute(
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
    import { InputChoice, InputEmail } from '$lib/elements/forms';

    export let selectedAttribute: Models.AttributeEmail = null;
    export let data: Partial<Models.AttributeEmail>;

    $: if (selectedAttribute) {
        data.required = selectedAttribute.required;
        data.array = selectedAttribute.array;
        data.default = selectedAttribute.default;
    }

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputEmail
    id="default"
    label="Default value"
    bind:value={data.default}
    disabled={data.required}
    readonly={!!selectedAttribute} />
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
