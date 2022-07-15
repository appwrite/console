<script lang="ts">
    import { InputSwitch, InputSelect, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export let key: string;
    let def = '',
        elements: string[],
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        try {
            await sdkForProject.databases.createEnumAttribute(
                $collection.$id,
                key,
                elements,
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

    $: options =
        elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];
</script>

<InputTags id="elements" label="Elements" bind:tags={elements} placeholder="Add elements here" />
<InputSelect id="default" label="Default" bind:options bind:value={def} />
<InputSwitch id="required" label="Required" bind:value={required} />
<InputSwitch id="required" label="Array" bind:value={array} />
