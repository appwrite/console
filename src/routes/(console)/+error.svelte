<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
</script>

<Container>
    <div class="u-flex-vertical u-gap-16">
        <Heading size="1" tag="h3">{$page.error.status || 'Invalid Argument'}</Heading>
        <Heading size="4" tag="h4" trimmed={false}>{$page.error.message}</Heading>
        <Button href={base}>Back to the console</Button>
    </div>
</Container>
