<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitPoint(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnPoint>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createPointColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: JSON.stringify(data?.default)
        });
    }
    export async function updatePoint(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnPoint>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updatePointColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: JSON.stringify(data?.default),
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { InputShape } from '$lib/elements/forms';

    export let data: Partial<Models.ColumnPoint> = {
        required: false,
        default: [0, 0]
    };

    import { createConservative } from '$lib/helpers/stores';
    import { Selector } from '@appwrite.io/pink-svelte';

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;

    const DEFAULT_STATE_DUMMY_DATA = [0, 0];

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default ?? [0, 0];
            data.default = null;
        } else {
            data.default = savedDefault ?? [0, 0];
        }
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnPoint>>({
        required: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required);

    $: showDefaultPointDummyData = $required ? true : false;
</script>

<InputShape
    values={data.default as number[]}
    defaultValues={DEFAULT_STATE_DUMMY_DATA}
    showDefaults={showDefaultPointDummyData} />

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />
