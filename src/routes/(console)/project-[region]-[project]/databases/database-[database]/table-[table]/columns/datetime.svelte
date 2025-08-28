<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';

    export async function submitDatetime(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnDatetime>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.createDatetimeColumn({
                databaseId,
                tableId,
                key,
                required: data.required,
                xdefault: data.default,
                array: data.array
            });
    }

    export async function updateDatetime(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnDatetime>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.updateDatetimeColumn({
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
    import { InputDateTime } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.ColumnDatetime>;

    import { createConservative } from '$lib/helpers/stores';
    import { Selector } from '@appwrite.io/pink-svelte';

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
    } = createConservative<Partial<Models.ColumnDatetime>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputDateTime
    id="default"
    label="Default value"
    bind:value={data.default}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array} />
<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />
<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this column is an array. Defaults to an empty array." />
