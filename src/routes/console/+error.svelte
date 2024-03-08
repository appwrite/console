<script>
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
</script>

<Container>
    <Heading size="1" tag="h3">{$page.status}</Heading>
    <Heading size="3" tag="h4">{$page.error.message}</Heading>
    <Button href="/console">Back to the console</Button>
</Container>
