<script lang="ts">
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';
    import Alert from '$lib/components/alert.svelte';
    import { isCloud } from '$lib/system';

    export let show = false;

    let name: string;
    let id: string;
    let showCustomId = false;
    let error: string;

    const dispatch = createEventDispatcher();

    async function create() {
        try {
            const org = await sdk.forConsole.teams.create(id ?? ID.unique(), name);
            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`/console/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            trackEvent(Submit.OrganizationCreate, {
                customId: !!id
            });
            name = null;
            id = null;
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationCreate);
        }
    }
</script>

<Modal title="Create new organization" {error} onSubmit={create} size="big" bind:show>
    {#if isCloud}
        <Alert type="info">
            <svelte:fragment slot="title">Get ready for Appwrite Pro</svelte:fragment>
            We will soon introduce the much-anticipated Pro plan. Your account will continue to have
            access to <b>one free Starter organization</b>. If you manage more than one
            organization, you will need to either upgrade to the Pro plan, transfer your projects to
            a Pro organization, or migrate to self-hosting.
            <svelte:fragment slot="buttons">
                <Button href="https://appwrite.io/pricing" external text>Learn more</Button>
            </svelte:fragment>
        </Alert>
    {/if}
    <FormList>
        <InputText
            id="organization-name"
            label="Name"
            placeholder="Enter name"
            bind:value={name}
            autofocus={true}
            required />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Organization ID
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Organization" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
