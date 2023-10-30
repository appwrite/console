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

    let name: string = null;
    onMount(async () => {
        name ??= $topic.name;
    });
    async function updateName() {
        try {
            // await sdk.forProject.users.updateName($provider.$id, providerName);
            await sdk.forProject.client.call(
                'PATCH',
                new URL(`${sdk.forProject.client.config.endpoint}/messaging/topics/${$topic.$id}`),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                },
                {
                    name: name
                }
            );
            await invalidate(Dependencies.MESSAGING_TOPIC);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingTopicUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingTopicUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Name</Heading>

        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={name} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $topic.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
