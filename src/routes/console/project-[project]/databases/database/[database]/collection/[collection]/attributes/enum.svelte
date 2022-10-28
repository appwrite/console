<script lang="ts">
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { page } from '$app/stores';

    export let key: string;
    export let submitted = false;
    export let overview = false;
    export let selectedAttribute: Models.AttributeEnum;

    const databaseId = $page.params.database;
    const dispatch = createEventDispatcher();

    let xdefault = '',
        elements: string[],
        required = false,
        array = false;

    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createEnumAttribute(
                databaseId,
                $collection.$id,
                key,
                elements,
                required,
                xdefault ? xdefault : undefined,
                array
            );
            dispatch('created', attribute);
            addNotification({
                type: 'success',
                message: `${key} has been created`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: options =
        elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];

    $: if (submitted) {
        submit();
    }
    $: if (overview) {
        ({ required, array, elements } = selectedAttribute);
        xdefault = selectedAttribute.default;
    }
    $: if (required) {
        xdefault = null;
    }
</script>

<InputTags
    id="elements"
    label="Elements"
    bind:tags={elements}
    placeholder="Add elements here"
    readonly={overview} />
<InputSelect
    id="default"
    label="Default value"
    bind:options
    bind:value={xdefault}
    disabled={overview || required} />
<InputChoice id="required" label="Required" bind:value={required} disabled={overview}>
    Indicate whether this is a required attribute</InputChoice>
<InputChoice id="array" label="Array" bind:value={array} disabled={overview}>
    Indicate whether this attribute should act as an array</InputChoice>
