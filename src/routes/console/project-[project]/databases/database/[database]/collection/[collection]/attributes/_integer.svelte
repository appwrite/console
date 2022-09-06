<script lang="ts">
    import { InputNumber, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    const dispatch = createEventDispatcher();

    export let key: string = null;
    export let submitted = false;
    export let overview = false;
    export let selectedAttribute: Models.AttributeInteger;
    let min: number,
        max: number,
        xdefault: number,
        required = false,
        array = false;

    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createIntegerAttribute(
                $collection.$id,
                key,
                required,
                min,
                max,
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
        ({ required, array, min, max } = selectedAttribute);
        xdefault = selectedAttribute.default;
    }
</script>

<InputNumber id="min" label="Min" bind:value={min} readonly={overview} />
<InputNumber id="max" label="Max" bind:value={max} readonly={overview} />

<InputNumber id="default" label="Default value" bind:value={xdefault} readonly={overview} />
<InputChoice id="required" label="Required" bind:value={required} disabled={overview}>
    Indicate whether this is a required attribute</InputChoice>
<InputChoice id="array" label="Array" bind:value={array} disabled={overview}>
    Indicate whether this attribute should act as an array</InputChoice>
