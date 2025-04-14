<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, id: string, error: string;
    let showCustomId = false;

    const create = async () => {
        try {
            const team = await sdk
                .forProject($page.params.region, $page.params.project)
                .teams.create(id ?? ID.unique(), name);
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

<Modal title="Create team" {error} size="big" bind:show={showCreate} onSubmit={create}>
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
            <CustomId autofocus bind:show={showCustomId} name="Team" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
