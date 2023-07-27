<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

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
            data.default,
            data.array
        );
    }
    export async function updateBoolean(
        databaseId: string,
        collectionId: string,

        data: Partial<Models.AttributeBoolean>
    ) {
        await sdk.forProject.databases.updateBooleanAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeBoolean> = {
        required: false,
        array: false,
        default: null
    };

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputSelect
    id="default"
    label={$LL.console.project.forms.databases.attribute.inputs.default.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.default.placeholder()}
    disabled={data.required || data.array}
    options={[
        { label: 'NULL', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
    ]}
    bind:value={data.default} />
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
