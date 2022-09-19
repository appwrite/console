<script lang="ts">
    import { Modal } from '$lib/components';
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
            await sdkForProject.functions.createExecution(selectedDeployment.$id);
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

<Form on:submit={handleSubmit}>
    <Modal bind:show={showExecute} size="big">
        <svelte:fragment slot="header">Execute Function</svelte:fragment>
        <FormList>
            <InputTextarea bind:value={data} id="data" label="Custom data (optional)" />
            <InputChoice type="switchbox" id="json" label="Show example JSON" bind:value={showJson}>
                Here's an example of some custom data.</InputChoice>
            {#if showJson}
                <pre>
            <code>
{`name: 'John Doe',
age: 42,
    address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345'
        }
`}
            </code>
        </pre>
            {/if}
        </FormList>

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showExecute = false)}>Cancel</Button>
            <Button submit>Execute Now</Button>
        </svelte:fragment>
    </Modal>
</Form>
