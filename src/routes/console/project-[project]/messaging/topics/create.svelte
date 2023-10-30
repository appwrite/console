<script lang="ts">
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
            const topic = await sdk.forProject.client.call(
                'POST',
                new URL(sdk.forProject.client.config.endpoint + '/messaging/topics'),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                },
                {
                    topicId: id ?? ID.unique(),
                    name: name
                }
            );
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

<Modal title="Create topic" {error} size="big" bind:show={showCreate} onSubmit={create}>
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
                    <span class="text"> Topic ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Topic" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
