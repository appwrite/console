<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputPassword, InputEmail, InputText, Form } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, mail: string, pass: string;

    const create = async () => {
        try {
            const user = await sdkForProject.users.create('unique()', mail, pass, name);
            mail = pass = name = '';
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
        <InputText
            id="name"
            label="Name"
            placeholder="John Doe"
            autofocus={true}
            bind:value={name} />
        <InputEmail
            id="email"
            label="E-Mail"
            placeholder="test@example.com"
            required={true}
            bind:value={mail} />
        <InputPassword
            id="password"
            label="Password"
            placeholder="*****"
            required={true}
            bind:value={pass} />
        <Pill>User ID <i class="icon-duplicate" /></Pill>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
