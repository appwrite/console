<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    let { data } = $props();

    onMount(async () => {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('projectId');
        const origin = params.get('origin');
        const path = params.get('path');
        try {
            const results = await Promise.all(
                (data.organizations?.teams ?? []).map((org) =>
                    sdk.forConsole.organization(org.$id).listProjects({
                        queries: [
                            Query.equal('$id', projectId),
                            Query.limit(1),
                            Query.select(['$id', 'region'])
                        ],
                        total: false
                    })
                )
            );
            const project = results.find((r) => r.projects[0])?.projects[0];

            if (!project) {
                await goto(
                    `${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`
                );
                return;
            }

            await sdk.forProject(project.region ?? 'default', projectId).project.get();
            const jwt = await sdk.forConsole.account.createJWT();
            window.location.href = `${origin}/_appwrite/authorize?jwt=${jwt.jwt}&path=${path}`;
        } catch {
            await goto(
                `${base}/auth/preview/access?origin=${origin}&path=${path}&projectId=${projectId}`
            );
        }
    });
</script>

<svelte:head>
    <title>Preview - Appwrite</title>
</svelte:head>

<Layout.Stack alignItems="center" justifyContent="center" style="max-width: 400px">
    <Layout.Stack direction="row" alignItems="center" justifyContent="center" gap="s">
        <Spinner size="s" />
        <Typography.Text>Authenticating...</Typography.Text>
    </Layout.Stack>
    <Typography.Title size="xl" align="center">
        Please wait while we verify your access
    </Typography.Title>
</Layout.Stack>
