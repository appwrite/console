<script lang="ts">
    import { InputSwitch, InputSelect, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';

    export let id: string;
    export let submitted = false;
    let def = '',
        elements: string[],
        required = false,
        array = false;

    const dispatch = createEventDispatcher();
    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createEnumAttribute(
                $collection.$id,
                id,
                elements,
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

    $: options =
        elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];

    $: if (submitted) {
        submit();
    }
</script>

<InputTags id="elements" label="Elements" bind:tags={elements} placeholder="Add elements here" />
<InputSelect id="default" label="Default" bind:options bind:value={def} />
<InputSwitch id="required" label="Required" bind:value={required} />
<InputSwitch id="required" label="Array" bind:value={array} />
