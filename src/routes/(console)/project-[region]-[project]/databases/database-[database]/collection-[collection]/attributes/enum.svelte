<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitEnum(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEnum>
    ) {
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.createEnumAttribute(
                databaseId,
                collectionId,
                key,
                data.elements,
                data.required,
                data.default,
                data.array
            );
    }

    export async function updateEnum(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeEnum>,
        originalKey?: string
    ) {
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.updateEnumAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.elements,
                data.required,
                data.default,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEnum>;

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
    } = createConservative<Partial<Models.AttributeEnum>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);

    $: options = [
        ...(data?.elements ?? []).map((element) => {
            return {
                label: element,
                value: element
            };
        }),
        !data.required &&
            !data.array && {
                label: 'NULL',
                value: null
            }
    ].filter(Boolean);
</script>

<InputTags
    id="elements"
    label="Elements"
    bind:tags={data.elements}
    placeholder="Add elements here"
    tooltip="Enum elements have a maximum length of 255 characters. This limit can not be exceeded."
    required>
</InputTags>

<InputSelect
    id="default"
    label="Default value"
    disabled={data.array || data.required}
    placeholder="Select a value"
    {options}
    bind:value={data.default} />
<InputChoice id="required" label="Required" bind:value={data.required} disabled={data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice id="array" label="Array" bind:value={data.array} disabled={data.required || editing}>
    Indicate whether this attribute should act as an array, with the default value set as an empty
    array.
</InputChoice>
