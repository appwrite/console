<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export async function submitLine(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnLine>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createLineColumn({
            databaseId,
            tableId,
            key,
            required: data.required,
            xdefault: JSON.stringify(data?.default)
        });
    }
    export async function updateLine(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnLine>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateLineColumn({
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
    export let data: Partial<Models.ColumnLine> = {
        required: false,
        default: [
            [0, 0],
            [0, 0]
        ]
    };

    import { createConservative } from '$lib/helpers/stores';
    import { Selector, Layout, Typography } from '@appwrite.io/pink-svelte';
    import InputLine from '$lib/elements/forms/inputLine.svelte';

    let savedDefault = data.default;
    let showDefaultPointDummyData = false;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default ?? [
                [0, 0],
                [0, 0]
            ];
            data.default = null;
        } else {
            data.default = savedDefault ?? [
                [0, 0],
                [0, 0]
            ];
        }
    }

    function pushCoordinate() {
        (data.default as number[][]).push([0, 0]);
    }

    const {
        stores: { required },
        listen
    } = createConservative<Partial<Models.ColumnLine>>({
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
    <InputLine
        values={data.default as number[][]}
        addCoordinate={pushCoordinate}
        showDefaults={showDefaultPointDummyData} />
</Layout.Stack>
