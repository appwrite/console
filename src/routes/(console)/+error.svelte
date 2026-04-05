<script lang="ts">
    import { goto } from '$app/navigation';
    import { base, resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { isVerifyEmailRedirectError } from '$lib/helpers/emailVerification';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';

    $effect(() => {
        const verifyEmailPath = resolve('/verify-email');
        if (isVerifyEmailRedirectError(page.error) && page.url.pathname !== verifyEmailPath) {
            goto(verifyEmailPath, { replaceState: true });
        }
    });
</script>

<Container>
    <div>
        <Typography.Title size="xl"
            >{'status' in page.error
                ? page.error.status || 'Invalid Argument'
                : 'Invalid Argument'}</Typography.Title>
        <Typography.Title>{page.error.message}</Typography.Title>
    </div>
    <div>
        <Button href={base}>Back to the console</Button>
    </div>
</Container>
