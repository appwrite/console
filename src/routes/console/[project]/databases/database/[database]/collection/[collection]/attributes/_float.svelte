<script lang="ts">
    import { InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    const dispatch = createEventDispatcher();

    export let key: string;
    let min: number,
        max: number,
        def: number,
        required = false,
        array = false;

    const submit = async () => {
        try {
            await sdkForProject.databases.createFloatAttribute(
                $collection.$id,
                key,
                required,
                min,
                max,
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

<InputNumber id="min" label="Min" bind:value={min} />
<InputNumber id="max" label="Max" bind:value={max} />

<InputSwitch id="required" label="Required" bind:value={required} />
<InputSwitch id="array" label="Array" bind:value={array} />
<InputNumber id="default" label="Default" bind:value={def} />
