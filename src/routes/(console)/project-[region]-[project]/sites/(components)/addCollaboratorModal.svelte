<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { InputEmail, Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { roles } from '$lib/stores/billing';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { isCloud, isSelfHosted } from '$lib/system';

    export let show = false;

    const dispatch = createEventDispatcher();

    const url = `${page.url.origin}${base}/invite`;

    let email: string,
        name: string,
        error: string,
        role: string = isSelfHosted ? 'owner' : 'viewer';

    async function create() {
        try {
            const team = await sdk.forConsole.teams.createMembership(
                $organization.$id,
                [role],
                email,
                undefined,
                undefined,
                url,
                name || undefined
            );
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.MEMBERS);

            show = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            trackEvent(Submit.MemberCreate);
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    }

    $: if (!show) {
        error = null;
        email = null;
        name = null;
    }
</script>

<Modal title="Add collaborator" {error} bind:show onSubmit={create}>
    <span slot="description">
        Share your progress and start collaborating by adding members to your organization.
    </span>
    <Layout.Stack direction="row">
        <InputEmail
            required
            id="email"
            label="Email"
            placeholder="Enter email"
            autofocus={true}
            bind:value={email} />
        {#if isCloud}
            <InputSelect
                id="role"
                label="Role"
                placeholder="Select role"
                required
                options={roles}
                bind:value={role} />
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit submissionLoader>Send invite</Button>
    </svelte:fragment>
</Modal>
