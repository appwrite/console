<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let showGitInstall: boolean;

    function connectGitHub() {
        const redirect = new URL($page.url);
        redirect.searchParams.append('alert', 'installation-created');
        const target = new URL(
            `${sdk.forProject.client.config.endpoint}/v1/vcs/github/installations`
        );
        target.searchParams.set('projectId', $page.params.project);
        target.searchParams.set('redirect', redirect.toString());
        goto(target);
    }
</script>

<Modal headerDivider={false} bind:show={showGitInstall} size="big">
    <svelte:fragment slot="header">Connect to Git</svelte:fragment>
    <p>Select a provider to import an existing git repositories.</p>

    <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
        <Button on:click={connectGitHub} fullWidth secondary>
            <span class="icon-github" aria-hidden="true" />
            <span class="text">Continue with GitHub</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-gitlab" aria-hidden="true" />
            <span class="text">GitLab (coming soon)</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-bitBucket" aria-hidden="true" />
            <span class="text">BitBucket (coming soon)</span>
        </Button>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showGitInstall = false)}>Cancel</Button>
    </svelte:fragment>
</Modal>
