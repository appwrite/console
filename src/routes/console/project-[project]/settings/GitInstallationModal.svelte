<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';

    export let showGitIstall: boolean;

    function connectGitHub() {
        sdk.forProject.vcs.createGitHubInstallation(
            window.location.href + '?alert=installation-created'
        );
    }
</script>

<Modal headerDivider={false} bind:show={showGitIstall} size="big">
    <svelte:fragment slot="header">Connect to Git</svelte:fragment>
    <p>Select a provider to import an existing git repositories.</p>

    <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
        <button
            on:click={() => connectGitHub()}
            class="button is-secondary u-width-full-line u-main-center">
            <span class="icon-github" aria-hidden="true" />
            <span class="text">Continue with GitHub</span>
        </button>
        <button disabled class="button is-secondary u-width-full-line u-main-center">
            <span class="icon-gitlab" aria-hidden="true" />
            <span class="text">GitLab (coming soon)</span>
        </button>
        <button disabled class="button is-secondary u-width-full-line u-main-center">
            <span class="icon-bitBucket" aria-hidden="true" />
            <span class="text">BitBucket (comong soon)</span>
        </button>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showGitIstall = false)}>Cancel</Button>
    </svelte:fragment>
</Modal>
