<script lang="ts">
    import { Code, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { InputTextarea, FormList, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let selectedFunction: Models.Function = null;

    let show = false;
    let data: string = null;
    let showJson = false;
    let submitting = false;

    const example = `
{
    firstName: "hello", 
    lastName:"world", 
    age:"old"
}`;

    $: if (selectedFunction && !show) {
        show = true;
    }

    const handleSubmit = async () => {
        submitting = true;
        try {
            await sdkForProject.functions.createExecution(
                selectedFunction.$id,
                data?.length ? data : undefined,
                true
            );
            close();
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            submitting = false;
        }
    };

    function close() {
        selectedFunction = null;
        show = false;
    }
</script>

<Modal bind:show size="big" on:submit={handleSubmit} on:close={close}>
    <svelte:fragment slot="header">Execute Function</svelte:fragment>
    <FormList>
        <InputTextarea bind:value={data} id="data" label="Custom data (optional)" />
        <InputChoice type="switchbox" id="json" label="Show example JSON" bind:value={showJson}>
            Here's an example of some custom data.</InputChoice>
        {#if showJson}
            <Code noMargin language="json" withLineNumbers code={example} />
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={close}>Cancel</Button>
        <Button disabled={submitting} submit>Execute Now</Button>
    </svelte:fragment>
</Modal>
