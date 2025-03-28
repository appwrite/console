<script lang="ts">
    import { onMount } from 'svelte';

    import { goto } from '$app/navigation';
    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';

    export let data;
    onMount(() => {
        goto(data.route);
    });
</script>

<svelte:head>
    <title>Redirecting - Appwrite</title>
</svelte:head>

<Layout.Stack alignItems="center" justifyContent="center" style="max-width: 400px">
    <Layout.Stack direction="row" alignItems="center" justifyContent="center" gap="s">
        <Spinner size="s" />
        <Typography.Text>Redirecting...</Typography.Text>
    </Layout.Stack>
    <Typography.Title size="xl" align="center">Please wait while we redirect you</Typography.Title>
</Layout.Stack>
