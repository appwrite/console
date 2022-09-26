<script lang="ts">
    import { InputNumber, InputText, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { page } from '$app/stores';

    export let key: string;
    export let submitted = false;
    export let overview = false;
    export let selectedAttribute: Models.AttributeString;

    const databaseId = $page.params.database;

    let xdefault: string,
        size = 255,
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createStringAttribute(
                databaseId,
                $collection.$id,
                key,
                size,
                required,
                xdefault ? xdefault : undefined,
                array
            );
            dispatch('created', attribute);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: if (submitted) {
        submit();
    }

    $: if (overview) {
        ({ required, array, size } = selectedAttribute);
        xdefault = selectedAttribute.default;
    }
</script>

<InputNumber id="size" label="Size" bind:value={size} required readonly={overview} />
<InputText id="default" label="Default value" bind:value={xdefault} readonly={overview} />
<InputChoice id="required" label="Required" bind:value={required} disabled={overview}>
    Indicate whether this is a required attribute</InputChoice>
<InputChoice id="array" label="Array" bind:value={array} disabled={overview}>
    Indicate whether this attribute should act as an array</InputChoice>
