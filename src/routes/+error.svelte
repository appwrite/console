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
            The domain you are trying to access is not configured in Appwrite. Please verify the URL or contact the administrator.
        </Typography.Title>
        <Button href={base}>Back to console</Button>
    </Layout.Stack>
</Unauthenticated>
