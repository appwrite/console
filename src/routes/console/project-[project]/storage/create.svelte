<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk, sdkForProject } from '$lib/stores/sdk';
    import { ID } from '@aw-labs/appwrite-console';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const bucket = await sdkForProject().storage.createBucket(id ? id : ID.unique(), name);
            showCreate = false;
            dispatch('created', bucket);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            name = null;
            trackEvent(Submit.BucketCreate, {
                customId: !!id
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BucketCreate);
        }
    };

    $: if (!showCustomId) {
        id = null;
    }
    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal {error} on:submit={create} size="big" bind:show={showCreate}>
    <svelte:fragment slot="header">Create Bucket</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="New Bucket"
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text"> Bucket ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Bucket" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
