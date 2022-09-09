<script lang="ts">
    import { InputChoice, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { collection } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    export let submitted = false;
    export let key: string;
    export let overview = false;
    export let selectedAttribute: Models.AttributeBoolean;

    const dispatch = createEventDispatcher();

    let xdefault: boolean,
        required = false,
        array = false;

    const submit = async () => {
        submitted = false;
        try {
            const attribute = await sdkForProject.databases.createBooleanAttribute(
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

    //TODO: refactor to use context module instead of submitted
</script>

<InputSelect
    id="default"
    label="Default value"
    placeholder="Select a value"
    options={[
        { label: 'True', value: true },
        { label: 'False', value: false }
    ]}
    bind:value={xdefault}
    disabled={overview} />
<InputChoice id="required" label="Required" bind:value={required} disabled={overview}>
    Indicate whether this is a required attribute</InputChoice>
<InputChoice id="array" label="Array" bind:value={array} disabled={overview}>
    Indicate whether this attribute should act as an array</InputChoice>
