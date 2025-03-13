<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';
    import { isCloud } from '$lib/system';
    import { base } from '$app/paths';
    import { Alert } from '@appwrite.io/pink-svelte';

    export let show = false;

    let name: string;
    let error: string;

    const dispatch = createEventDispatcher();

    async function create() {
        try {
            const org = await sdk.forConsole.teams.create(ID.unique(), name);
            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`${base}/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            trackEvent(Submit.OrganizationCreate);
            name = null;
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationCreate);
        }
    }
</script>

<Modal title="Create new organization" {error} onSubmit={create} bind:show>
    {#if isCloud}
        <Alert.Inline status="info" title="Get ready for Appwrite Pro">
            We will soon introduce the much-anticipated Pro plan. Your account will continue to have
            access to <b>one free organization</b>. If you manage more than one organization, you
            will need to either upgrade to the Pro plan, transfer your projects to a Pro
            organization, or migrate to self-hosting.
            <svelte:fragment slot="actions">
                <Button href="https://appwrite.io/pricing" external text>Learn more</Button>
            </svelte:fragment>
        </Alert.Inline>
    {/if}
    <FormList>
        <InputText
            id="organization-name"
            label="Name"
            placeholder="Enter name"
            bind:value={name}
            autofocus={true}
            required />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
