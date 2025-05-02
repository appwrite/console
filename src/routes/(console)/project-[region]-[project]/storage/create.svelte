<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = false;
    let error: string;

    const create = async () => {
        try {
            const bucket = await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.createBucket(id ? id : ID.unique(), name);
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

<Modal title="Create bucket" {error} onSubmit={create} bind:show={showCreate}>
    <InputText
        id="name"
        label="Name"
        placeholder="New bucket"
        bind:value={name}
        autofocus
        required />

    {#if !showCustomId}
        <div>
            <Tag
                size="s"
                on:click={() => {
                    showCustomId = true;
                }}><Icon icon={IconPencil} /> Bucket ID</Tag>
        </div>
    {:else}
        <CustomId autofocus bind:show={showCustomId} name="Bucket" bind:id />
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
