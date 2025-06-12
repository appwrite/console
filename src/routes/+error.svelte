<script>
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { Unauthenticated } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system.js';
</script>

<Unauthenticated>
    <Typography.Title size="xl"
        >{'status' in page.error
            ? page.error.status || 'Invalid Argument'
            : 'Invalid Argument'}</Typography.Title>
    <Typography.Title>{page.error.message}</Typography.Title>
    <Button href={base}>Back to the {isStudio ? 'studio' : 'console'}</Button>
</Unauthenticated>
