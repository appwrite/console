<script lang="ts">
    import { InputText, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    export let key: string;
    export let submitted = false;
    export let overview = false;
    export let selectedAttribute: Models.AttributeEmail;

    let xdefault: string,
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createEmailAttribute(
                $collection.$id,
                key,
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
        ({ required, array } = selectedAttribute);
        xdefault = selectedAttribute.default;
    }
</script>

<InputSwitch id="required" label="Required" bind:value={required} disabled={overview} />
<InputSwitch id="required" label="Array" bind:value={array} disabled={overview} />
<InputText id="default" label="Default" bind:value={xdefault} readonly={overview} />
