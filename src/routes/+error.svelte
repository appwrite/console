<script>
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import { Badge, Typography, Layout } from '@appwrite.io/pink-svelte';
</script>

{#await resolvedProfile.component.getUnauthenticated() then Unauthenticated}
    <Unauthenticated>
        <Layout.Stack gap="l" alignItems="center">
            <Badge variant="secondary" content="404 Page not found" />
            <Typography.Title size="l" align="center">
                The page you're looking for doesn't exist.
            </Typography.Title>
            <Button href={base}>Back to console</Button>
        </Layout.Stack>
    </Unauthenticated>
{/await}
