<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitMediumtext(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnString>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.createMediumtextColumn({
                databaseId,
                tableId,
                key,
                required: data.required,
                xdefault: data.default,
                array: data.array
            });
    }
    export async function updateMediumtext(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnString>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.updateMediumtextColumn({
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
    import { createConservative } from '$lib/helpers/stores';
    import RequiredArrayCheckboxes from './requiredArrayCheckboxes.svelte';
    import { InputTextarea } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let data: Partial<Models.ColumnString> = {
        required: false,
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

<Layout.Stack gap="xs" direction="column">
    <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary">
        Maximum size: 4,194,303 characters
    </Typography.Text>
</Layout.Stack>

<InputTextarea
    id="default"
    label="Default"
    placeholder="Enter text"
    bind:value={data.default}
    disabled={data.required || data.array || disabled}
    nullable={!data.required && !data.array} />

<RequiredArrayCheckboxes
    {editing}
    {disabled}
    bind:array={data.array}
    bind:required={data.required} />
