<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitFloat(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeFloat>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.createFloatAttribute(
                databaseId,
                collectionId,
                key,
                data.required,
                data.min,
                data.max,
                data.default,
                data.array
            );
    }

    export async function updateFloat(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeFloat>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.updateFloatAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.required,
                data.default,
                data.min,
                data.max,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeFloat> = {
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
    } = createConservative<Partial<Models.AttributeFloat>>({
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
        step="any"
        required={editing} />
    <InputNumber
        id="max"
        label="Max"
        placeholder="Enter size"
        bind:value={data.max}
        step="any"
        required={editing} />
</Layout.Stack>
<InputNumber
    id="default"
    label="Default value"
    placeholder="Enter value"
    min={data.min}
    max={data.max}
    bind:value={data.default}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array}
    step="any" />
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
    description="Indicate whether this attribute should act as an array, with the default value set as an empty
    array." />
