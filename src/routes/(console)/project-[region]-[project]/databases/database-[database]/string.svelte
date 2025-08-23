<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitString(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnString>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.createStringColumn(
                databaseId,
                tableId,
                key,
                data.size,
                data.required,
                data.default,
                data.array
            );
    }
    export async function updateString(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnString>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.updateStringColumn(
                databaseId,
                tableId,
                originalKey,
                data.required,
                data.default,
                data.size,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import { InputChoice, InputNumber, InputText, InputTextarea } from '$lib/elements/forms';

    export let data: Partial<Models.ColumnString> = {
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
    placeholder="Enter size"
    bind:value={data.size}
    required={!editing}
    readonly={editing} />
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
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required column
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this column should act as an array, with the default value set as an empty
    array.
</InputChoice>
