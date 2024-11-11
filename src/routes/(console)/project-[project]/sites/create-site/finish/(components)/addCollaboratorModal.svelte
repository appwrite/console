<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Alert, Modal } from '$lib/components';
    import { InputText, InputEmail, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud } from '$lib/system';
    import { roles } from '$lib/stores/billing';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import Roles from '$lib/components/roles/roles.svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    const url = `${$page.url.origin}${base}/invite`;

    let email: string,
        name: string,
        error: string,
        role: string = 'developer';

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

            showCreate = false;
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

    $: if (!showCreate) {
        error = null;
        email = null;
        name = null;
    }
</script>

<Modal
    title="Add collaborators"
    description="Share your progress and start collaborating by adding members to your organization."
    {error}
    bind:show={showCreate}
    onSubmit={create}>
    <InputEmail
        required
        id="email"
        label="Email"
        placeholder="Enter email"
        autofocus={true}
        bind:value={email} />
    <InputSelect popover={Roles} id="role" label="Role" options={roles} bind:value={role} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit submissionLoader>Send invite</Button>
    </svelte:fragment>
</Modal>
