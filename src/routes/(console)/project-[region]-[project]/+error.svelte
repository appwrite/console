<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Card, Typography } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    function getResource(id: string) {
        id = id.replace('/(console)/project-[region]-[project]/', '');
        let parts = id.split('/');
        const resource = parts[0];

        return resource === 'settings' ? 'project' : resource;
    }
</script>

<Container>
    {#if page.error.type === 'general_resource_blocked'}
        {@const resource = getResource(page.route.id)}
        <Card.Base>
            <Typography.Title size="s">Your {capitalize(resource)} is paused</Typography.Title>
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
