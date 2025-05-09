<script>
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
</script>

<Container>
    <Typography.Title size="xl"
        >{'status' in page.error
            ? page.error.status || 'Invalid Argument'
            : 'Invalid Argument'}</Typography.Title>
    <p class="body-text-2 u-bold u-margin-block-start-4">{page.error.message}</p>
</Container>
