<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
</script>

<Container>
    <div>
        <Typography.Title size="xl">{$page.error.status || 'Invalid Argument'}</Typography.Title>
        <Typography.Title>{$page.error.message}</Typography.Title>
    </div>
    <div>
        <Button href={base}>Back to the console</Button>
    </div>
</Container>
