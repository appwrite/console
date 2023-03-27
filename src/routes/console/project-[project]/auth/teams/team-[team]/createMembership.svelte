<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, Alert } from '$lib/components';
    import { Button, InputEmail, InputText, InputTags, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let name: string, email: string, roles: string[];
    let error: string;

    const create = async () => {
        const url = `${$page.url.origin}/console/project-${$page.params.project}/auth/teams/team-${$page.params.team}/members`;

        try {
            const user = await sdk.forProject.teams.createMembership(
                teamId,
                roles,
                url,
                email || undefined,
                undefined,
                undefined,
                name || undefined
            );
            addNotification({
                type: 'success',
                message: `${name ? name : email} created successfully`
            });
            trackEvent(Submit.MemberCreate);
            email = name = '';
            roles = [];
            showCreate = false;
            dispatch('created', user);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    };
</script>

<Modal {error} onSubmit={create} size="big" bind:show={showCreate}>
    <svelte:fragment slot="header">Create Membership</svelte:fragment>
    <FormList>
        <InputEmail
            id="email"
            label="Email"
            placeholder="Enter email"
            required={true}
            autofocus={true}
            bind:value={email} />
        <InputText id="name" label="Name (optional)" placeholder="Enter name" bind:value={name} />
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
