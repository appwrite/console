<script lang="ts">
    import { Vcs, Client } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';

    export let data;

    const endpoint = getApiEndpoint();
    const client = new Client();
    const vcs = new Vcs(client);

    let installationId: string;
    let repositoryId: string;
    let providerPullRequestId: string;

    let error = '';
    let success = '';
    let loading = false;

    onMount(async () => {
        repositoryId = data.repositoryId;
        installationId = data.installationId;
        providerPullRequestId = data.providerPullRequestId;

        client.setEndpoint(endpoint).setProject(data.projectId).setMode('admin');
    });

    async function approveDeployment() {
        if (loading) {
            return;
        }

        loading = true;
        error = '';
        success = '';

        try {
            await vcs.updateExternalDeployments({
                installationId,
                repositoryId,
                providerPullRequestId
            });
            success = 'Deployment approved successfully! Build will start soon.';
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<Layout.Stack gap="l" alignItems="center" style="max-width: 500px;">
    {#if error}
        <Badge type="error" variant="secondary" content={error} />
    {/if}
    {#if success}
        <Badge type="success" variant="secondary" content={success} />
    {/if}
    <Typography.Title size="l" align="center">
        The deployment for pull request #{providerPullRequestId}
        is awaiting approval. When authorized, deployments will be started.
    </Typography.Title>
    <Button on:click={approveDeployment} secondary>Approve Deployment</Button>
</Layout.Stack>
