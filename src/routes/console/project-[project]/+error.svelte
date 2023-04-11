<script>
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
</script>

<Container>
    <Heading size="1" tag="h3">{$page.status}</Heading>
    <p class="body-text-2 u-bold u-margin-block-start-4">{$page.error.message}</p>
</Container>
