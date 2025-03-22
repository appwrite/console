<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitIp(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeIp>
    ) {
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.createIpAttribute(
                databaseId,
                collectionId,
                key,
                data.required,
                data.default,
                data.array
            );
    }
    export async function updateIp(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeIp>,
        originalKey?: string
    ) {
        const $page = get(page);
        await sdk
            .forProject($page.params.region, $page.params.project)
            .databases.updateIpAttribute(
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
    import { InputText, InputChoice } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeIp>;

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
    } = createConservative<Partial<Models.AttributeIp>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputText
    id="default"
    label="Default value"
    placeholder="Enter value"
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
