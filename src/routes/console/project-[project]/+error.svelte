<script>
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
</script>

<Container>
    <Heading size="1" tag="h3">{$page.status}</Heading>
    <Heading size="3" tag="h4">{$page.error.message}</Heading>
</Container>
