<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitInteger(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeInteger>
    ) {
        await sdk.forProject.databases.createIntegerAttribute(
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

    export async function updateInteger(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeInteger>,
        originalKey?: string
    ) {
        await sdk.forProject.databases.updateIntegerAttribute(
            databaseId,
            collectionId,
            originalKey,
            data.required,
            data.default,
            Math.abs(data.min) > Number.MAX_SAFE_INTEGER ? undefined : data.min,
            Math.abs(data.max) > Number.MAX_SAFE_INTEGER ? undefined : data.max,
            data.key !== originalKey ? data.key : undefined
        );
    }
</script>

<script lang="ts">
    import { InputNumber, InputChoice } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeInteger> = {
        required: false,
        min: 0,
        max: 0,
        default: 0,
        array: false
    };
    export let editing = false;

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
    } = createConservative<Partial<Models.AttributeInteger>>({
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
                required={editing} />
        </li>

        <li class="u-flex-basis-50-percent">
            <InputNumber
                id="max"
                label="Max"
                placeholder="Enter size"
                bind:value={data.max}
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
    nullable={!data.required && !data.array} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array, with the default value set as an empty
    array.
</InputChoice>
