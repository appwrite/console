<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, Alert } from '$lib/components';
    import { Button, InputEmail, InputText, InputTags, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let name: string, email: string, roles: [];

    const create = async () => {
        try {
            //TODO update url to correct one?
            const user = await sdkForProject.teams.createMembership(
                teamId,
                email,
                roles,
                $page.url.origin,
                name
            );
            addNotification({
                type: 'success',
                message: `${name ? name : email} created successfully`
            });
            email = name = '';
            roles = [];
            showCreate = false;
            dispatch('created', user);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={create}>
    <Modal bind:show={showCreate}>
        <svelte:fragment slot="header">Create User</svelte:fragment>

        <InputEmail
            id="email"
            label="E-Mail"
            placeholder="test@example.com"
            required={true}
            autofocus={true}
            bind:value={email} />
        <InputText id="name" label="Name(optional)" placeholder="John Doe" bind:value={name} />
        <Alert type="info">
            <p>Roles are used to manage access permissions. You can create any role you want.</p>
        </Alert>

        <InputTags id="tags" label="Roles" placeholder="Add roles" bind:tags={roles} />

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
