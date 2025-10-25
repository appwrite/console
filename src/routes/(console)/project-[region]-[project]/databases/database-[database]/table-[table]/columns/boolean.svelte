<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitBoolean(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnBoolean>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createBooleanColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: data.default,
            array: data.array
        });
    }
    export async function updateBoolean(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnBoolean>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateBooleanColumn({
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
    import { InputSelect } from '$lib/elements/forms';

    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';

    export let editing = false;
    export let data: Partial<Models.ColumnBoolean> = {
        required: false,
        array: false,
        default: null
    };

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
    } = createConservative<Partial<Models.ColumnBoolean>>({
        required: false,
        array: false,
        ...data
    });

    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputSelect
    id="default"
    label="Default value"
    placeholder="Select a value"
    disabled={data.required || data.array}
    options={[
        { label: 'NULL', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
    ]}
    bind:value={data.default} />

<RequiredArrayCheckboxes {editing} bind:array={data.array} bind:required={data.required} />
