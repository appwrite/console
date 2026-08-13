<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { NewRepository, Repositories } from '$lib/components/git';
    import ConnectGit from '$lib/components/git/connectGit.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import RepositoryBehaviour from '$lib/components/git/repositoryBehaviour.svelte';
    import { page } from '$app/state';
    import { connectGitHub } from '$lib/stores/git';
    import type { VcsInstallationErrorKind } from '$lib/helpers/vcsError';
    import InstallationError from './installationError.svelte';

    let {
        show = $bindable(false),
        product,
        callbackState = null,
        onlyExisting = false,
        connect = async () => {}
    }: {
        show?: boolean;
        product: 'functions' | 'sites';
        callbackState?: Record<string, string>;
        onlyExisting?: boolean;
        connect?: (installationId: string, repositoryId: string) => Promise<void>;
    } = $props();

    let repositoryBehaviour: 'new' | 'existing' | undefined = $state(
        onlyExisting ? 'existing' : undefined
    );
    let repositoryName = $state('');
    let repositoryPrivate = $state(true);
    let selectedInstallationId = $state('');
    let selectedRepository = $state('');
    let installations = $state({ installations: [], total: 0 });
    let error = $state('');
    // Set by <Repositories> when the list failed because the installation is
    // broken. The permissions hint in the footer is wrong in that case: no
    // amount of scope fiddling fixes a token Appwrite can no longer refresh.
    let installationErrorKind = $state<VcsInstallationErrorKind | null>(null);

    onMount(async () => {
        installations = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';
        if (installations?.total) {
            repositoryBehaviour = 'existing';
        }
    });

    $effect(() => {
        if ($installation?.$id) {
            selectedInstallationId = $installation.$id;
        }
    });

    async function connectRepo() {
        try {
            if (repositoryBehaviour === 'new') {
                const repo = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.createRepository({
                        installationId: $installation.$id,
                        name: repositoryName,
                        xprivate: repositoryPrivate
                    });
                repository.set(repo);
                selectedRepository = repo.id;
            }

            await connect(selectedInstallationId, selectedRepository);
            show = false;
            addNotification({
                type: 'success',
                message: 'Repository connected successfully'
            });
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal
    title="Connect repository"
    bind:show
    hideFooter={!repositoryBehaviour}
    onSubmit={connectRepo}
    bind:error>
    <span slot="description">
        Connect your {product === 'functions' ? 'function' : 'site'} to an existing repository or create
        a new one.
    </span>
    {#if !!installations?.total}
        <Layout.Stack gap="xl">
            {#if !onlyExisting}
                <RepositoryBehaviour bind:repositoryBehaviour />
            {/if}
            {#if repositoryBehaviour === 'new'}
                {#if installationErrorKind}
                    <!-- Create is disabled below for the same reason, so say why
                         here rather than leaving a dead button. -->
                    <InstallationError
                        kind={installationErrorKind}
                        provider={$installation?.provider}
                        organization={$installation?.organization} />
                {/if}
                <NewRepository
                    bind:repositoryName
                    bind:repositoryPrivate
                    bind:selectedInstallationId
                    {installations} />
            {:else}
                <Repositories
                    bind:selectedRepository
                    bind:installationErrorKind
                    {product}
                    action="button"
                    {callbackState}
                    connect={async (e) => {
                        trackEvent(Click.ConnectRepositoryClick, {
                            from: product
                        });
                        repository.set(e);
                        repositoryName = e.name;
                        selectedRepository = e.id;
                        if (!selectedInstallationId && $installation?.$id) {
                            selectedInstallationId = $installation.$id;
                        }
                        try {
                            await connect(selectedInstallationId, e.id);
                            show = false;
                            addNotification({
                                type: 'success',
                                message: 'Repository connected successfully'
                            });
                        } catch (error) {
                            addNotification({
                                type: 'error',
                                message: error?.message ?? 'Failed to connect repository'
                            });
                        }
                    }} />
            {/if}
        </Layout.Stack>
    {:else}
        <ConnectGit {callbackState} />
    {/if}
    <svelte:fragment slot="footer">
        {#if repositoryBehaviour === 'existing' && !installationErrorKind}
            <Layout.Stack>
                <Link variant="quiet" href={connectGitHub(callbackState).toString()}>
                    <Layout.Stack direction="row" gap="xs">
                        Missing a repository? check your permissions <Icon
                            icon={IconArrowSmRight} />
                    </Layout.Stack>
                </Link>
            </Layout.Stack>
        {:else if repositoryBehaviour === 'new'}
            <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
            <!-- Creating a repository refreshes the installation token first, so
                 it fails the same way the listing just did. -->
            <Button
                size="s"
                submit
                disabled={!repositoryName || !$installation?.$id || !!installationErrorKind}>
                Create
            </Button>
        {/if}
    </svelte:fragment>
</Modal>
