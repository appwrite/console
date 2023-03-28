<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';

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
            data.default ? (data.default as string) : undefined,
            data.array
        );
    }
    export async function updateString(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>
    ) {
        console.log(data);
        await sdk.forProject.databases.updateStringAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            (data.default as string) || undefined
        );
    }
</script>

<script lang="ts">
    import { InputNumber, InputText, InputChoice } from '$lib/elements/forms';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';

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
    label="Size"
    placeholder="Enter size"
    bind:value={data.size}
    required
    readonly={editing} />
{#if data.size > 50}
    <InputTextarea
        id="default"
        label="Default value"
        placeholder="Enter value"
        bind:value={data.default}
        maxlength={data.size}
        disabled={data.required || data.array} />
{:else}
    <InputText
        id="default"
        label="Default value"
        placeholder="Enter value"
        bind:value={data.default}
        maxlength={data.size}
        disabled={data.required || data.array} />
{/if}
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array
</InputChoice>
