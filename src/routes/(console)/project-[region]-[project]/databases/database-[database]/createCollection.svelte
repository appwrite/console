<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const databaseId = $page.params.database;
    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = true;
    let error: string;

    const create = async () => {
        error = null;
        try {
            const collection = await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.createCollection(databaseId, id ? id : ID.unique(), name);
            showCreate = false;
            dispatch('created', collection);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            name = id = null;
            trackEvent(Submit.CollectionCreate, {
                customId: !!id
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.CollectionCreate);
        }
    };

    $: if (!showCreate) {
        error = null;
        showCustomId = false;
        id = null;
        name = '';
    }
</script>

<Modal title="Create collection" size="big" bind:show={showCreate} onSubmit={create} bind:error>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter collection name"
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Collection ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Collection"
                bind:id
                fullWidth={true} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
