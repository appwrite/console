<script lang="ts">
    import { page } from '$app/stores';

    import { Modal } from '$lib/components';
    import { InputText, InputEmail, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization, memberList } from '$lib/stores/organization';
    import { pageLimit } from '$lib/stores/layout';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let email: string, name: string, error: string;
    const url = `${$page.url.origin}/console/`;

    const create = async () => {
        try {
            const team = await sdkForConsole.teams.createMembership(
                $organization.$id,
                email,
                [],
                url,
                name
            );
            showCreate = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            memberList.load($organization.$id, '', $pageLimit, 0);
            dispatch('created', team);
        } catch ({ message }) {
            error = message;
        }
    };

    $: if (!showCreate) {
        error = null;
    }
</script>

<Form on:submit={create}>
    <Modal {error} size="big" bind:show={showCreate}>
        <svelte:fragment slot="header">Invite Member</svelte:fragment>
        <FormList>
            <InputEmail
                id="email"
                label="Email"
                placeholder="Enter email"
                autofocus={true}
                bind:value={email} />
            <InputText
                id="name"
                label="Name (optional)"
                placeholder="Enter name"
                bind:value={name} />
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Send invite</Button>
        </svelte:fragment>
    </Modal>
</Form>
