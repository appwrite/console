<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { webhook } from './store';
    import Delete from './delete.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Card, Typography } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete webhooks</svelte:fragment>
    The webhook will be permanently deleted. This action is irreversible.
    <svelte:fragment slot="aside">
        <Card.Base variant="secondary" padding="s">
            <Typography.Text variant="m-600">{$webhook.name}</Typography.Text>
            <Typography.Text>Last updated: {toLocaleDateTime($webhook.$updatedAt)}</Typography.Text>
        </Card.Base>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            on:click={() => {
                showDelete = true;
                trackEvent(Click.SettingsWebhookDeleteClick);
            }}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
