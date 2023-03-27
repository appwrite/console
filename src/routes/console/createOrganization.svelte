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

    export let show = false;

    let name: string;
    let id: string;
    let showCustomId = false;
    let error: string;

    const dispatch = createEventDispatcher();

    const create = async () => {
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
    };
</script>

<Modal {error} onSubmit={create} size="big" bind:show>
    <svelte:fragment slot="header">Create New Organization</svelte:fragment>
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
