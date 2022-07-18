<script lang="ts">
    import { InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export let submitted = false;
    export let id: string;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    let def: boolean,
        required = false,
        array = false;

    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createBooleanAttribute(
                $collection.$id,
                id,
                required,
                def ? def : undefined,
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
</script>

<InputSwitch id="required" label="Required" bind:value={required} {disabled} />
<InputSwitch id="array" label="Array" bind:value={array} {disabled} />
<InputSwitch id="default" label="Default" bind:value={def} {disabled} />
