<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';

    export let showGitInstall: boolean;

    function connectGitHub() {
        const redirect = new URL($page.url);
        redirect.searchParams.append('alert', 'installation-created');
        const target = new URL(
            `${sdk.forProject($page.params.region, $page.params.project).client.config.endpoint}/vcs/github/authorize`
        );
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target;
    }
</script>

<Modal title="Install" headerDivider={false} bind:show={showGitInstall} size="big">
    <p>Select a provider to import an existing git repository.</p>

    <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
        <Button href={connectGitHub().toString()} fullWidth secondary>
            <span class="icon-github" aria-hidden="true" />
            <span class="text">GitHub</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-gitlab" aria-hidden="true" />
            <span class="text">GitLab (coming soon)</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-bitBucket" aria-hidden="true" />
            <span class="text">BitBucket (coming soon)</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-azure" aria-hidden="true" />
            <span class="text">Azure (coming soon)</span>
        </Button>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showGitInstall = false)}>Cancel</Button>
    </svelte:fragment>
</Modal>
