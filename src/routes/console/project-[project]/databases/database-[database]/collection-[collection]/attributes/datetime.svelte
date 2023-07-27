<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import LL from '$i18n/i18n-svelte';

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
    label={$LL.console.project.forms.databases.attribute.inputs.default.label()}
    bind:value={data.default}
    disabled={data.required || data.array} />
<InputChoice
    id="required"
    label={$LL.console.project.forms.databases.attribute.inputs.required.label()}
    bind:value={data.required}
    disabled={data.array}>
    {$LL.console.project.forms.databases.attribute.texts.phraseOne()}
</InputChoice>
<InputChoice
    id="array"
    label={$LL.console.project.forms.databases.attribute.inputs.array.label()}
    bind:value={data.array}
    disabled={data.required || editing}>
    {$LL.console.project.forms.databases.attribute.texts.phraseTwo()}
</InputChoice>
