<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitIp(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeIp>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
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
        await sdk
            .forProject(page.params.region, page.params.project)
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
    import { InputText } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeIp>;

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
