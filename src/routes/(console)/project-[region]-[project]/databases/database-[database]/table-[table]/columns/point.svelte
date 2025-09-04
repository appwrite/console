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
    import { InputNumber } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.ColumnPoint> = {
        required: false,
        default: [0, 0]
    };

    import { createConservative } from '$lib/helpers/stores';
    import { Selector, Layout } from '@appwrite.io/pink-svelte';

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;

    const DEFAULT_STATE_DUMMY_DATA = [0, 0];

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default ?? [0, 0];
            data.default = null;
            showDefaultPointDummyData = true;
        } else {
            data.default = savedDefault ?? [0, 0];
            showDefaultPointDummyData = false;
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
</script>

<Layout.Stack direction="row">
    {#if showDefaultPointDummyData}
        {#each DEFAULT_STATE_DUMMY_DATA}
            <InputNumber id="default" placeholder="Enter value" disabled={true} />
        {/each}
    {:else}
        {#each data.default as number[] as _, index}
            <InputNumber
                id="default"
                placeholder="Enter value"
                bind:value={data.default[index]}
                disabled={data.required}
                step={0.001} />
        {/each}
    {/if}
</Layout.Stack>

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />
