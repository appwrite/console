<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';

    export async function submitDatetime(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeDatetime>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.createDatetimeAttribute(
                databaseId,
                collectionId,
                key,
                data.required,
                data.default,
                data.array
            );
    }

    export async function updateDatetime(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeDatetime>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.updateDatetimeAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.required,
                data.default,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { InputDateTime } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeDatetime>;

    import { createConservative } from '$lib/helpers/stores';
    import { Selector } from '@appwrite.io/pink-svelte';

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
    } = createConservative<Partial<Models.AttributeDatetime>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputDateTime
    id="default"
    label="Default value"
    bind:value={data.default}
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
    description="Indicate whether this attribute should act as an array, with the default value set as an empty
    array." />
