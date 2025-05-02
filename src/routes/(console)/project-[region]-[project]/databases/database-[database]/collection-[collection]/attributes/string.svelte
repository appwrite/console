<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitString(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.createStringAttribute(
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
        data: Partial<Models.AttributeString>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.updateStringAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.required,
                data.default,
                data.size,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';
    import { createConservative } from '$lib/helpers/stores';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false
    };
    export let editing = false;

    let savedDefault = data.default;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
        }
    }

    const {
        stores: { required, array },
        listen
    } = createConservative<Partial<Models.AttributeString>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputNumber
    id="size"
    label="Size"
    placeholder="Enter size"
    bind:value={data.size}
    required={true} />
{#if data.size >= 50}
    <InputTextarea
        id="default"
        label="Default"
        placeholder="Enter string"
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{:else}
    <InputText
        id="default"
        label="Default"
        placeholder="Enter string"
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{/if}
<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this attribute is required" />
<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this attribute should act as an array, with the default value set as an empty
    array." />
