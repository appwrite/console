<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitFloat(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeFloat>
    ) {
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
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
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
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
    import { InputNumber, InputChoice } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeFloat> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };

    import { createConservative } from '$lib/helpers/stores';

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

<div>
    <ul class="u-flex u-gap-16">
        <li class="u-flex-basis-50-percent">
            <InputNumber
                id="min"
                label="Min"
                placeholder="Enter size"
                bind:value={data.min}
                step="any"
                required={editing} />
        </li>
        <li class="u-flex-basis-50-percent">
            <InputNumber
                id="max"
                label="Max"
                placeholder="Enter size"
                bind:value={data.max}
                step="any"
                required={editing} />
        </li>
    </ul>
</div>
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
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array, with the default value set as an empty
    array.
</InputChoice>
