<script lang="ts">
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { InputText, InputEmail, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let email: string, name: string, error: string;
    const url = `${$page.url.origin}/invite`;

    const create = async () => {
        try {
            const team = await sdkForConsole.teams.createMembership(
                $organization.$id,
                email,
                ['owner'],
                url,
                name
            );
            invalidate(Dependencies.ACCOUNT);
            showCreate = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            trackEvent('submit_organization_member_create');
            dispatch('created', team);
        } catch ({ message }) {
            error = message;
        }
    };

    $: if (!showCreate) {
        error = null;
        email = null;
        name = null;
    }
</script>

<Modal {error} size="big" bind:show={showCreate} on:submit={create}>
    <svelte:fragment slot="header">Invite Member</svelte:fragment>
    <FormList>
        <InputEmail
            id="email"
            label="Email"
            placeholder="Enter email"
            autofocus={true}
            bind:value={email} />
        <InputText id="name" label="Name (optional)" placeholder="Enter name" bind:value={name} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Send invite</Button>
    </svelte:fragment>
</Modal>
