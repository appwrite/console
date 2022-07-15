<script lang="ts">
    import { InputNumber, InputText, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export let key: string;
    let def: string,
        size = 255,
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        try {
            await sdkForProject.databases.createStringAttribute(
                $collection.$id,
                key,
                size,
                required,
                def ? def : undefined,
                array
            );
            dispatch('close');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<InputNumber id="size" label="Size" bind:value={size} required />
<InputSwitch id="required" label="Required" bind:value={required} />
<InputSwitch id="required" label="Array" bind:value={array} />
<InputText id="default" label="Default" bind:value={def} />
