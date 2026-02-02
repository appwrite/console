<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitVarchar(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnString>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createVarcharColumn({
            databaseId,
            tableId,
            key,
            size: data.size,
            required: data.required,
            xdefault: data.default,
            array: data.array
        });
    }
    export async function updateVarchar(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnString>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateVarcharColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data.default,
            size: data.size,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';

    export let data: Partial<Models.ColumnString> = {
        required: false,
        size: 255,
        array: false
    };

    export let editing = false;
    export let disabled = false;

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
    } = createConservative<Partial<Models.ColumnString>>({
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
    required
    {disabled}
    placeholder="Enter size"
    bind:value={data.size}
    min={1}
    max={16383} />

<svelte:component
    this={data.size >= 50 ? InputTextarea : InputText}
    id="default"
    label="Default"
    placeholder="Enter string"
    maxlength={data.size}
    bind:value={data.default}
    disabled={data.required || data.array || disabled}
    nullable={!data.required && !data.array} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
