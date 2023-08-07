<script>
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Unauthenticated } from '$lib/layout';
</script>

<Unauthenticated>
    <Heading size="1" tag="h3">{$page.status}</Heading>
    <Heading size="3" tag="h4">{$page.error.message}</Heading>
    <Button href="/">{$LL.console.button.backToConsole()}</Button>
</Unauthenticated>
