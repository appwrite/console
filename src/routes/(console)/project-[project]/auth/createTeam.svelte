<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { InputText, Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, id: string, error: string;
    let showCustomId = false;

    const create = async () => {
        try {
            const team = await sdk.forProject.teams.create(id ?? ID.unique(), name);
            name = '';
            showCreate = false;
            showCustomId = false;
            addNotification({
                type: 'success',
                message: `${team.name} has been created`
            });
            trackEvent(Submit.TeamCreate, {
                customId: !!id
            });
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TeamCreate);
        }
    };

    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal title="Create team" {error} size="m" bind:show={showCreate} onSubmit={create}>
    <InputText
        id="name"
        label="Name"
        placeholder="Enter name"
        autofocus={true}
        required
        bind:value={name} />
    {#if !showCustomId}
        <div>
            <Tag size="s" on:click={() => (showCustomId = !showCustomId)}
                ><Icon icon={IconPencil} /> Team ID</Tag>
        </div>
    {:else}
        <CustomId autofocus bind:show={showCustomId} name="Team" bind:id />
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
