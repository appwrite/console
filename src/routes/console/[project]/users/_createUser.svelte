<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputPassword, InputEmail, InputText, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let idModal = false;
    let name: string, mail: string, pass: string, id: string;

    const create = async () => {
        try {
            const user = await sdkForProject.users.create(id ? id : 'unique()', mail, pass, name);
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
        <div class="tag common-section " on:click={() => (idModal = !idModal)}>
            User ID<i class="icon-pencil" />
        </div>

        {#if idModal}
            <div class="common-section">
                <p>Enter a custom user ID. Leave blank for a randomly generated user ID.</p>
                <InputText id="id" label="" placeholder="" bind:value={id} />
            </div>
        {/if}

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
