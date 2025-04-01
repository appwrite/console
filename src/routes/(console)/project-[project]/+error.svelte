<script>
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
</script>

<Container>
    <Typography.Title size="xl">{page.error.status || 'Invalid Argument'}</Typography.Title>
    <p class="body-text-2 u-bold u-margin-block-start-4">{page.error.message}</p>
</Container>
