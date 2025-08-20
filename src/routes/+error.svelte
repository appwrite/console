<script>
    import { base } from '$app/paths';
    import { Unauthenticated } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Badge, Typography, Layout } from '@appwrite.io/pink-svelte';
</script>

<Unauthenticated>
    <Layout.Stack gap="l" alignItems="center">
        <Badge variant="secondary" content="404 Page not found" />
        <Typography.Title size="l" align="center">
            The page you're looking for doesn't exist.
        </Typography.Title>
        <Button href={base}>Back to console</Button>
    </Layout.Stack>
</Unauthenticated>
