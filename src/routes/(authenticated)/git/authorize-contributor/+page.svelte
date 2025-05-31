<script lang="ts">
    import { page } from '$app/state';
    import { app } from '$lib/stores/app';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import { Vcs, Client } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';

    const endpoint = getApiEndpoint();
    const client = new Client();
    const vcs = new Vcs(client);

    let installationId: string;
    let repositoryId: string;
    let providerPullRequestId: string;

    let loading = false;
    let error = '';
    let success = '';

    onMount(async () => {
        const projectId = page.url.searchParams.get('projectId');
        client.setEndpoint(endpoint).setProject(projectId).setMode('admin');

        installationId = page.url.searchParams.get('installationId');
        repositoryId = page.url.searchParams.get('repositoryId');
        providerPullRequestId = page.url.searchParams.get('providerPullRequestId') + '';
    });

    async function approveDeployment() {
        if (loading) {
            return;
        }

        loading = true;
        error = '';
        success = '';

        try {
            await vcs.updateExternalDeployments(
                installationId,
                repositoryId,
                providerPullRequestId
            );
            success = 'Deployment approved successfully! Build will start soon.';
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<section class="container" style="display: grid; place-items: center; min-height: 100vh;">
    <div class="u-flex u-flex-vertical u-cross-center" style="width: 100%">
        <div class="card" style="min-width: 600px; max-width: 100%;">
            <h1 class="heading-level-2">Authorize External Deployment</h1>
            <small style="margin-block-start: 8px;display: block;"
                >The deployment for pull request <code class="inline-code"
                    >#{providerPullRequestId}</code> is awaiting approval. When authorized, deployments
                will be started.
            </small>

            <div class="with-borders" style="margin-block-start: 1rem;display: block;">
                <button disabled={loading} on:click={approveDeployment} class="button" type="button"
                    >Approve Deployment</button>
            </div>

            {#if error}
                <p style="margin-block-start: 1rem" class="u-color-text-danger">{error}</p>
            {/if}

            {#if success}
                <p style="margin-block-start: 1rem" class="u-color-text-success">{success}</p>
            {/if}
        </div>
        <div class="u-gap-4 u-flex u-main-center u-cross-center" style="margin-block-start: 2rem;">
            <span class="text">Powered by</span>
            <a
                href="https://appwrite.io/"
                target="_blank"
                style="display: grid;place-items: center;">
                {#if $app.themeInUse === 'dark'}
                    <img
                        src={AppwriteLogoDark}
                        width="120"
                        class="u-block u-only-dark"
                        alt="Appwrite Logo" />
                {:else}
                    <img
                        src={AppwriteLogoLight}
                        width="120"
                        class="u-block u-only-light"
                        alt="Appwrite Logo" />
                {/if}
            </a>
        </div>
    </div>
</section>
