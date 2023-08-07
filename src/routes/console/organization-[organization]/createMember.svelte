<script lang="ts">
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { InputText, InputEmail, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let email: string, name: string, error: string;
    const url = `${$page.url.origin}/invite`;

    async function create() {
        try {
            const team = await sdk.forConsole.teams.createMembership(
                $organization.$id,
                ['owner'],
                url,
                email,
                undefined,
                undefined,
                name || undefined
            );
            await invalidate(Dependencies.ACCOUNT);
            showCreate = false;
            addNotification({
                type: 'success',
                message: `${$LL.components.notification.inviteSentTo()} ${email}`
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

<Modal {error} size="big" bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header"
        >{$LL.console.organization.forms.createMember.title()}</svelte:fragment>
    <FormList>
        <InputEmail
            required
            id="email"
            label={$LL.console.organization.forms.createMember.inputs.email.label()}
            placeholder={$LL.console.organization.forms.createMember.inputs.email.placeholder()}
            autofocus={true}
            bind:value={email} />
        <InputText
            id="member-name"
            label={$LL.console.organization.forms.createMember.inputs.name.label()}
            placeholder={$LL.console.organization.forms.createMember.inputs.name.placeholder()}
            bind:value={name} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}
            >{$LL.console.organization.button.submit.cancel()}</Button>
        <Button submit>{$LL.console.organization.button.submit.send()}</Button>
    </svelte:fragment>
</Modal>
