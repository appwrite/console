<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, Alert } from '$lib/components';
    import { Button, InputEmail, InputText, InputTags, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let name: string, email: string, roles: string[];
    let error: string;

    async function create() {
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
    }
</script>

<Modal {error} onSubmit={create} size="big" bind:show={showCreate}>
    <svelte:fragment slot="header">{$LL.console.project.title.createMembership()}</svelte:fragment>
    <FormList>
        <InputEmail
            id="email"
            label={$LL.console.project.forms.teams.createMembership.inputs.email.label()}
            placeholder={$LL.console.project.forms.teams.createMembership.inputs.email.placeholder()}
            required={true}
            autofocus={true}
            bind:value={email} />
        <InputText
            id="name"
            label={$LL.console.project.forms.teams.createMembership.inputs.name.label()}
            placeholder={$LL.console.project.forms.teams.createMembership.inputs.name.placeholder()}
            bind:value={name} />
        <Alert type="info">
            {$LL.console.project.alert.teams.createMembership()}
        </Alert>

        <InputTags
            id="tags"
            label={$LL.console.project.forms.teams.createMembership.inputs.roles.label()}
            placeholder={$LL.console.project.forms.teams.createMembership.inputs.roles.placeholder()}
            bind:tags={roles} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreate = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
