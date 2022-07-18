<script lang="ts">
    import { InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    export let submitted = false;
    export let id: string;
    export let overview = false;
    export let selectedAttribute: Models.AttributeBoolean;

    const dispatch = createEventDispatcher();

    let xdefault: boolean,
        required = false,
        array = false;

    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createBooleanAttribute(
                $collection.$id,
                id,
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
        ({ required, array, xdefault } = selectedAttribute);
    }
</script>

<InputSwitch id="required" label="Required" bind:value={required} disabled={overview} />
<InputSwitch id="array" label="Array" bind:value={array} disabled={overview} />
<InputSwitch id="default" label="Default" bind:value={xdefault} disabled={overview} />
