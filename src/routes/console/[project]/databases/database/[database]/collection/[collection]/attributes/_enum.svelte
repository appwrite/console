<script lang="ts">
    import { InputSwitch, InputSelect, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let submitted = false;
    export let overview = false;
    export let selectedAttribute: Models.AttributeEnum;
    let xdefault = '',
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

    $: options =
        elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];

    $: if (submitted) {
        submit();
    }
    $: if (overview) {
        ({ required, array, elements, xdefault } = selectedAttribute);
    }
</script>

<InputTags
    id="elements"
    label="Elements"
    bind:tags={elements}
    placeholder="Add elements here"
    readonly={overview} />
<InputSelect id="default" label="Default" bind:options bind:value={xdefault} disabled={overview} />
<InputSwitch id="required" label="Required" bind:value={required} disabled={overview} />
<InputSwitch id="required" label="Array" bind:value={array} disabled={overview} />
