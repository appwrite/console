<script>
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Card, Typography } from '@appwrite.io/pink-svelte';
</script>

<Container>
    {#if page.error.type === 'general_resource_blocked'}
        {@const resource = page.error.resource || 'project'}
        <Card.Base>
            <Typography.Title size="s">Your {resource} is paused</Typography.Title>
            <p class="text-red-500">
                We've detected unusual activity and temporarily paused your {resource}. If you
                believe this is a mistake or need urgent access, please contact support@appwrite.io.
            </p>
        </Card.Base>
    {:else}
        <Typography.Title size="xl"
            >{'status' in page.error
                ? page.error.status || 'Invalid Argument'
                : 'Invalid Argument'}</Typography.Title>
        <p class="body-text-2 u-bold u-margin-block-start-4">{page.error.message}</p>
    {/if}
</Container>
