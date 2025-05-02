<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputEmail, InputText, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let name: string, email: string, roles: string[];
    let error: string;

    async function create() {
        try {
            const user = await sdk
                .forProject(page.params.region, page.params.project)
                .teams.createMembership(
                    teamId,
                    roles,
                    email || undefined,
                    undefined,
                    undefined,
                    `${page.url.origin}${base}/invite`,
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
    }
</script>

<Modal title="Create membership" {error} onSubmit={create} bind:show={showCreate}>
    <InputEmail
        id="email"
        label="Email"
        placeholder="Enter email"
        required={true}
        autofocus={true}
        bind:value={email} />
    <InputText id="name" label="Name" placeholder="Enter name" bind:value={name} />
    <Alert.Inline status="info">
        Roles are used to manage access permissions. You can create any role you want.
    </Alert.Inline>

    <InputTags
        id="tags"
        label="Roles"
        placeholder="Add roles"
        bind:tags={roles}
        helper="Roles are used to manage access permissions. You can create any role you want." />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
