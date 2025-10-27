<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';

    export async function submitEmail(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnEmail>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createEmailColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: data.default,
            array: data.array
        });
    }

    export async function updateEmail(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnEmail>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateEmailColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data.default,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { InputEmail } from '$lib/elements/forms';
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

    export let editing = false;
    export let disabled = false;
    export let data: Partial<Models.ColumnEmail>;

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
    } = createConservative<Partial<Models.ColumnEmail>>({
        required: false,
        array: false,
        ...data
    });

    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputEmail
    id="default"
    label="Default value"
    placeholder="Enter value"
    bind:value={data.default}
    disabled={data.required || data.array || disabled}
    nullable={!data.required && !data.array} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
