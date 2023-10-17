<script lang="ts">
    import { goto } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string;
    let name: string;
    let showCustomId = false;
    let error: string;

    async function create() {
        try {
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                teamId,
                'default'
            );
            dispatch('created', project);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await goto(`/console/project-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        }
    }
</script>

<Modal title="Create project" {error} onSubmit={create} size="big" bind:show>
    <FormList>
        <InputText id="name" label="Name" bind:value={name} required autofocus={true} />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Project ID
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Project" isProject={true} bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
