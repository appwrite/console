<script lang="ts">
    import { InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';

    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export const dispatch = createEventDispatcher();

    let key: string;
    let def: boolean,
        required = false,
        array = false;

    const submit = async () => {
        try {
            await sdkForProject.databases.createBooleanAttribute(
                $collection.$id,
                key,
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

<InputSwitch id="required" label="Required" required bind:value={required} />
<InputSwitch id="array" label="Array" bind:value={array} />
<InputSwitch id="default" label="Default" bind:value={def} />
