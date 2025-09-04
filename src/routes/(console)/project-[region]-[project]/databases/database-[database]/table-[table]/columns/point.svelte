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
    import { InputPoint } from '$lib/elements/forms';

    export let data: Partial<Models.ColumnPoint> = {
        required: false,
        default: [0, 0]
    };

    import { createConservative } from '$lib/helpers/stores';
    import { Selector, Typography, Layout } from '@appwrite.io/pink-svelte';

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;

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

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required" />

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-600">Default</Typography.Text>
        <Typography.Caption variant="400">Optional</Typography.Caption>
    </Layout.Stack>
    <InputPoint values={data.default as number[]} showDefaults={showDefaultPointDummyData} />
</Layout.Stack>
