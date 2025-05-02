<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CustomId, Modal } from '$lib/components';
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

    let name: string, id: string, error: string;
    let showCustomId = false;

    const create = async () => {
        try {
            const topic = await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.createTopic(id ?? ID.unique(), name);
            name = '';
            showCreate = false;
            showCustomId = false;
            addNotification({
                type: 'success',
                message: `${topic.name} has been created`
            });
            trackEvent(Submit.MessagingTopicCreate, {
                customId: !!id
            });
            dispatch('created', topic);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MessagingTopicCreate);
        }
    };

    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal title="Create topic" {error} bind:show={showCreate} onSubmit={create}>
    <InputText
        id="name"
        label="Name"
        placeholder="Enter name"
        autofocus={true}
        required
        bind:value={name} />
    {#if !showCustomId}
        <div>
            <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                <Icon icon={IconPencil} size="s" slot="start" />
                Topic ID
            </Tag>
        </div>
    {:else}
        <CustomId autofocus bind:show={showCustomId} name="Topic" bind:id />
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
