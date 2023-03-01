<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitUrl(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeUrl>
    ) {
        await sdkForProject.databases.createUrlAttribute(
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
    import { InputText, InputChoice } from '$lib/elements/forms';

    export let selectedAttribute: Models.AttributeUrl;
    export let data: Partial<Models.AttributeUrl>;

    $: if (selectedAttribute) {
        ({ required: data.required, array: data.array, default: data.default } = selectedAttribute);
    }
    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputText
    id="default"
    label="Default value"
    bind:value={data.default}
    disabled={data.required || data.array}
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
