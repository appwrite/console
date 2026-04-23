<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Unauthenticated } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Badge, Typography, Layout } from '@appwrite.io/pink-svelte';
</script>

<Unauthenticated>
    <Layout.Stack gap="l" alignItems="center">
        <Badge variant="secondary" content="404 Page not found" />

        <Typography.Title size="l" align="center">
            {#if $page.error && $page.error.message && $page.error.message.includes('rule_not_found')}
                The domain you are trying to access is not configured in Appwrite.

                Please verify the URL or contact the administrator.
            {:else}
                {$page.error?.message || "The page you're looking for doesn't exist."}
            {/if}
        </Typography.Title>

        <Button href={base}>Back to console</Button>
    </Layout.Stack>
</Unauthenticated>