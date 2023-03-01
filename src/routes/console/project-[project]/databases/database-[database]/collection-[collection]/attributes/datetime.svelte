<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitDatetime(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeDatetime>
    ) {
        await sdkForProject.databases.createDatetimeAttribute(
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
    import { InputChoice, InputDateTime } from '$lib/elements/forms';

    export let selectedAttribute: Models.AttributeDatetime = null;
    export let data: Partial<Models.AttributeDatetime>;

    $: if (selectedAttribute) {
        data.required = selectedAttribute.required;
        data.array = selectedAttribute.array;
        data.default = selectedAttribute.default;
    }

    $: if (data.required) {
        data.default = null;
    }
</script>

<InputDateTime
    id="default"
    label="Default value"
    bind:value={data.default}
    disabled={data.required}
    readonly={!!selectedAttribute} />
<InputChoice
    id="required"
    label="Required"
    bind:value={data.required}
    disabled={!!selectedAttribute}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={!!selectedAttribute}>
    Indicate whether this attribute should act as an array
</InputChoice>
