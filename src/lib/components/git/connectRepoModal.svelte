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

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';
        if (!!installations?.total) {
            repositoryBehaviour = 'existing';
        }
    });

    async function connectRepo() {
        try {
            if (repositoryBehaviour === 'new') {
                const repo = await sdk.forProject.vcs.createRepository(
                    $installation.$id,
                    repositoryName,
                    repositoryPrivate
                );
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
                <NewRepository
                    bind:repositoryName
                    bind:repositoryPrivate
                    bind:selectedInstallationId
                    {installations} />
            {:else}
                <Repositories
                    bind:selectedRepository
                    {product}
                    action="button"
                    {callbackState}
                    connect={(e) => {
                        trackEvent(Click.ConnectRepositoryClick, {
                            from: product
                        });
                        repository.set(e);
                        repositoryName = e.name;
                        selectedRepository = e.id;
                        connectRepo();
                    }} />
            {/if}
        </Layout.Stack>
    {:else}
        <ConnectGit {callbackState} />
    {/if}
    <svelte:fragment slot="footer">
        {#if repositoryBehaviour === 'existing'}
            <Layout.Stack>
                <Link variant="quiet" href="#/">
                    <Layout.Stack direction="row" gap="xs">
                        Missing a repository? check your permissions <Icon
                            icon={IconArrowSmRight} />
                    </Layout.Stack>
                </Link>
            </Layout.Stack>
        {:else if repositoryBehaviour === 'new'}
            <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
            <Button size="s" submit disabled={!repositoryName || !$installation?.$id}>
                Create
            </Button>
        {/if}
    </svelte:fragment>
</Modal>
