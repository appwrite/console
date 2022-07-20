<script lang="ts">
    import { page } from '$app/stores';
    import { Modal, Alert } from '$lib/components';
    import { Button, InputEmail, InputText, InputTags, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let name: string, email: string, roles: [];

    const create = async () => {
        const url = `${$page.url.origin}/console/${$page.params.project}/users/teams/${$page.params.team}/members`;

        try {
            const user = await sdkForProject.teams.createMembership(
                teamId,
                email,
                roles,
                url,
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
        <FormList>
            <InputEmail
                id="email"
                label="Email"
                placeholder="Enter email"
                required={true}
                autofocus={true}
                bind:value={email} />
            <InputText
                id="name"
                label="Name (optional)"
                placeholder="Enter name"
                bind:value={name} />
            <Alert type="info">
                Roles are used to manage access permissions. You can create any role you want.
            </Alert>

            <InputTags id="tags" label="Roles" placeholder="Add roles" bind:tags={roles} />
        </FormList>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
