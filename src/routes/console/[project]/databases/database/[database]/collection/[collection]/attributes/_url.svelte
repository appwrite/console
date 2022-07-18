<script lang="ts">
    import { InputText, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export let id: string;
    export let submitted = false;
    let def: string,
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createUrlAttribute(
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

<InputSwitch id="required" label="Required" bind:value={required} />
<InputSwitch id="required" label="Array" bind:value={array} />
<InputText id="default" label="Default" bind:value={def} />
