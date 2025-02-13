<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Region } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string;
    let name: string;
    let showCustomId = false;
    let error: string;
    let disabled: boolean = false;

    async function create() {
        try {
            disabled = true;
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                teamId,
                Region.Default
            );
            show = false;
            dispatch('created', project);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await goto(`${base}/project-${project.region}-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
            disabled = false;
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
            <CustomId autofocus bind:show={showCustomId} name="Project" isProject bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit {disabled}>Create</Button>
    </svelte:fragment>
</Modal>
