<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { Roles } from '$lib/components/permissions';
    import { symmetricDifference } from '$lib/helpers/array';
    import { topic } from '../store';

    const topicId = page.params.topic;

    let arePermsDisabled = true;
    let permissions: string[] = [];

    onMount(async () => {
        permissions = $topic.subscribe || [];
    });

    async function updatePermissions() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.updateTopic(topicId, undefined, permissions);
            await invalidate(Dependencies.MESSAGING_TOPIC);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingTopicUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingTopicUpdatePermissions);
        }
    }

    $: arePermsDisabled = symmetricDifference(permissions, $topic.subscribe).length == 0;
</script>

<Form onSubmit={updatePermissions}>
    <CardGrid>
        <svelte:fragment slot="title">Subscription access</svelte:fragment>
        <p>
            Choose who can subscribe to this topic using the client API. Learn more about <a
                href="https://appwrite.io/docs/advanced/platform/permissions"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                Permissions</a
            >.
        </p>
        <svelte:fragment slot="aside">
            <Roles bind:roles={permissions} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePermsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
