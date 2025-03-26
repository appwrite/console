<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onMount } from 'svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { NewRepository, Repositories } from '$lib/components/git';
    import ConnectGit from '$lib/components/git/connectGit.svelte';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import RepositoryBehaviour from '$lib/components/git/repositoryBehaviour.svelte';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let site: Models.Site;
    export let callbackState: Record<string, string> = null;
    export let onlyExisting = false;

    let repositoryBehaviour: 'new' | 'existing' | undefined = onlyExisting ? 'existing' : undefined;
    let repositoryName = '';
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let installations = { installations: [], total: 0 };
    let hasInstallations = !!installations?.total;
    let error = '';

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';
        hasInstallations = !!installations?.total;
        if (hasInstallations) {
            repositoryBehaviour = 'existing';
        }
        console.log(selectedInstallationId);
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

            const s = await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site.framework as Framework,
                site.enabled,
                site.logging || undefined,
                site.timeout,
                site.installCommand,
                site.buildCommand,
                site.outputDirectory,
                site.buildRuntime as BuildRuntime,
                site.adapter as Adapter,
                site.fallbackFile,
                selectedInstallationId,
                selectedRepository,
                'main',
                undefined,
                undefined,
                undefined
            );
            invalidate(Dependencies.SITE);
            show = false;
            dispatch('connect', s);
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
        Connect your site to an existing repository or create a new one.
    </span>
    {#if hasInstallations}
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
                    bind:hasInstallations
                    bind:selectedRepository
                    product="sites"
                    action="button"
                    {callbackState}
                    on:connect={(e) => {
                        trackEvent(Click.ConnectRepositoryClick, {
                            from: 'sites'
                        });
                        repository.set(e.detail);
                        repositoryName = e.detail.name;
                        selectedRepository = e.detail.id;
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
