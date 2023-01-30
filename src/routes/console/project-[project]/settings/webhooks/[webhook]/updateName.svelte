<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { isNonNullableObject, type Nullable } from '$lib/helpers/type';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const projectId = $page.params.project;
    let name: Nullable<string> = null;

    onMount(async () => {
        name ??= $webhook.name;
    });

    async function updateName() {
        const args = { projectId, name };
        if (!isNonNullableObject(args)) return;
        try {
            await sdkForConsole.projects.updateWebhook(
                args.projectId,
                $webhook.$id,
                args.name,
                $webhook.events,
                $webhook.url,
                $webhook.security,
                $webhook.httpUser,
                $webhook.httpPass
            );
            invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook name has been updated'
            });
            trackEvent('submit_webhook_update_name');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={updateName}>
    <CardGrid>
        <Heading tag="h2" size="7">Update Name</Heading>
        <p>Choose any name that will help you distinguish between Webhooks.</p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="name"
                    label="Name"
                    bind:value={name}
                    required
                    placeholder="Enter name" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $webhook.name || !name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
