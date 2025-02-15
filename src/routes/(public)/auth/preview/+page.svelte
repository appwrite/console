<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    onMount(async () => {
        const params = new URLSearchParams(window.location.search);

        const projectId = params.get('projectId');
        const origin = params.get('origin');
        const path = params.get('path');
        try {
            await sdk.forConsole.projects.get(projectId);
            const jwt = await sdk.forConsole.account.createJWT();
            window.location.href = `${origin}/_appwrite/authorize?jwt=${jwt.jwt}&path=${path}`;
        } catch (error) {
            console.log(error);
            goto(
                `${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`
            );
        }
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
