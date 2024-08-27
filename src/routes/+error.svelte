<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Unauthenticated } from '$lib/layout';
</script>

<Unauthenticated>
    <Heading size="1" tag="h3">{$page.error.status || 'Invalid Argument'}</Heading>
    <Heading size="3" tag="h4">{$page.error.message}</Heading>
    <Button href={base}>Back to the console</Button>
</Unauthenticated>
