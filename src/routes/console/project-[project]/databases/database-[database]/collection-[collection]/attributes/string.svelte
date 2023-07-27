<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export async function submitString(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk.forProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            data.size,
            data.required,
            data.default,
            data.array
        );
    }
    export async function updateString(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk.forProject.databases.updateStringAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputNumber, InputText, InputTextarea } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false
    };
    export let editing = false;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputNumber
    id="size"
    label={$LL.console.project.forms.databases.attribute.inputs.size.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.size.placeholder()}
    bind:value={data.size}
    required={!editing}
    readonly={editing} />

{#if data.size >= 50}
    <InputTextarea
        id="default"
        label={$LL.console.project.forms.databases.attribute.inputs.string.label()}
        placeholder={$LL.console.project.forms.databases.attribute.inputs.string.placeholder()}
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{:else}
    <InputText
        id="default"
        label={$LL.console.project.forms.databases.attribute.inputs.string.label()}
        placeholder={$LL.console.project.forms.databases.attribute.inputs.string.placeholder()}
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{/if}

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
