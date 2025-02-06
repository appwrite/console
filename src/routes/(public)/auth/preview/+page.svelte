<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    onMount(async () => {
        //check if user has access
        //if not, redirect to login

        //simulate login
        setTimeout(() => {
            goto(`${base}/auth/preview/access`);
        }, 3000);
    });
</script>

<svelte:head>
    <title>Preview - Appwrite</title>
</svelte:head>

<Layout.Stack alignItems="center" justifyContent="center">
    <Layout.Stack direction="row" alignItems="center" justifyContent="center">
        <Spinner size="l" />
        <Typography.Text>Authenticating...</Typography.Text>
    </Layout.Stack>
    <Typography.Title>Please wait while we authenticate you</Typography.Title>
</Layout.Stack>
