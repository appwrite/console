<script lang="ts">
    import { Code, Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { InputTextarea, FormList } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let selectedDeployment: Models.Deployment = null;
    export let showExecute = false;
    let data: string = null;
    let showJson = false;

    const handleSubmit = async () => {
        try {
            await sdkForProject.functions.createExecution(selectedDeployment.$id, '{}');
            showExecute = false;
            addNotification({
                type: 'success',
                message: `Deployment has been executed`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form noMargin on:submit={handleSubmit}>
    <Modal bind:show={showExecute} size="big">
        <svelte:fragment slot="header">Execute Function</svelte:fragment>
        <FormList>
            <InputTextarea bind:value={data} id="data" label="Custom data (optional)" />
            <InputChoice type="switchbox" id="json" label="Show example JSON" bind:value={showJson}>
                Here's an example of some custom data.</InputChoice>
            {#if showJson}
                <Code
                    language="json"
                    showLineNumbers
                    code={`{
    firstName: "hello", 
    lastName:"world", 
    age:"old"
}`} />
            {/if}
        </FormList>

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showExecute = false)}>Cancel</Button>
            <Button submit>Execute Now</Button>
        </svelte:fragment>
    </Modal>
</Form>
