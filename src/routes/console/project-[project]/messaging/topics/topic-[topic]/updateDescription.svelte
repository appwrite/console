<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { topic } from './store';
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    let description: string = null;
    onMount(async () => {
        description ??= $topic.description;
    });
    async function updateDescription() {
        try {
            await sdk.forProject.client.call(
                'PATCH',
                new URL(`${sdk.forProject.client.config.endpoint}/messaging/topics/${$topic.$id}`),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                },
                {
                    description
                }
            );
            await invalidate(Dependencies.MESSAGING_TOPIC);
            addNotification({
                message: 'Description has been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingTopicUpdateDescription);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingTopicUpdateDescription);
        }
    }
</script>

<Form onSubmit={updateDescription}>
    <CardGrid>
        <Heading tag="h6" size="7">Description</Heading>

        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="description"
                    label="Description"
                    placeholder="Enter description"
                    autocomplete={false}
                    bind:value={description} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={description === $topic.description} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
