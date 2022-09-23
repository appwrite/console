<script lang="ts">
    import { Modal } from '$lib/components';
    import { scopes } from '$lib/constants';
    import { InputText, Button, Form, FormList, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../.../../store';

    export let show = false;

    const activeScopes = scopes.reduce((prev, next) => {
        prev[next] = false;

        return prev;
    }, {});

    let name: string;

    async function create() {
        try {
            await sdkForConsole.projects.createKey(
                $project.$id,
                name,
                scopes.filter((scope) => activeScopes[scope])
            );
            name = null;
            for (const scope in activeScopes) {
                activeScopes[scope] = false;
            }
            project.load($project.$id);
            show = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={create}>
    <Modal bind:show>
        <svelte:fragment slot="header">Create API Key</svelte:fragment>
        <FormList>
            <InputText id="name" label="Name" bind:value={name} autofocus required />
            {#each scopes as scope}
                <InputCheckbox id={scope} label={scope} bind:value={activeScopes[scope]} />
            {/each}
        </FormList>
        <svelte:fragment slot="footer">
            <Button submit>Register</Button>
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
