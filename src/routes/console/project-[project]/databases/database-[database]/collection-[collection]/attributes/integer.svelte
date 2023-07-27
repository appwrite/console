<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

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
            data.default,
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
            data.default
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

<InputNumber
    id="min"
    label={$LL.console.project.forms.databases.attribute.inputs.min.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.min.placeholder()}
    bind:value={data.min}
    required={editing} />

<InputNumber
    id="max"
    label={$LL.console.project.forms.databases.attribute.inputs.max.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.max.placeholder()}
    bind:value={data.max}
    required={editing} />

<InputNumber
    id="default"
    label={$LL.console.project.forms.databases.attribute.inputs.defaultValue.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.defaultValue.placeholder()}
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array} />

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
