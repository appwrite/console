<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, id: string, error: string | null;
    let showCustomId = false;

    const create = async () => {
        try {
            const team = await sdkForProject.teams.create(id ?? 'unique()', name);
            name = '';
            showCreate = false;
            showCustomId = false;
            addNotification({
                type: 'success',
                message: `${team.name} has been created`
            });
            trackEvent('submit_team_create');
            dispatch('created', team);
        } catch ({ message }) {
            error = message;
        }
    };

    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal {error} size="big" bind:show={showCreate} on:submit={create}>
    <svelte:fragment slot="header">Create Team</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter name"
            autofocus={true}
            required
            bind:value={name} />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" />
                    <span class="text"> Team ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Team" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
