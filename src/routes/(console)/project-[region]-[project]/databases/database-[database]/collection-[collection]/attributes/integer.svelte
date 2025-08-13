<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitInteger(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeInteger>
    ) {
        const min = data.min !== null && data.min !== undefined ? Math.round(data.min) : undefined;
        const max = data.max !== null && data.max !== undefined ? Math.round(data.max) : undefined;
        const defaultValue =
            data.default !== null && data.default !== undefined
                ? Math.round(data.default)
                : undefined;

        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.createIntegerAttribute(
                databaseId,
                collectionId,
                key,
                data.required,
                min,
                max,
                defaultValue,
                data.array
            );
    }

    export async function updateInteger(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeInteger>,
        originalKey?: string
    ) {
        const min = data.min !== null && data.min !== undefined ? Math.round(data.min) : data.min;
        const max = data.max !== null && data.max !== undefined ? Math.round(data.max) : data.max;
        const defaultValue =
            data.default !== null && data.default !== undefined
                ? Math.round(data.default)
                : data.default;

        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.updateIntegerAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.required,
                defaultValue,
                Math.abs(min) > Number.MAX_SAFE_INTEGER ? undefined : min,
                Math.abs(max) > Number.MAX_SAFE_INTEGER ? undefined : max,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';

    export let editing = false;

    export let data: Partial<Models.AttributeInteger> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };

    import { createConservative } from '$lib/helpers/stores';
    import { Layout, Selector } from '@appwrite.io/pink-svelte';

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
    } = createConservative<Partial<Models.AttributeInteger>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<Layout.Stack direction="row" gap="s">
    <InputNumber
        id="min"
        label="Min"
        placeholder="Enter size"
        bind:value={data.min}
        step={1}
        required={editing} />
    <InputNumber
        id="max"
        label="Max"
        placeholder="Enter size"
        bind:value={data.max}
        step={1}
        required={editing} />
</Layout.Stack>
<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    step={1}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array} />
<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this attribute is required" />
<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this attribute is an array. Defaults to an empty array." />
