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
    import { Runtime, type Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import RepositoryBehaviour from '$lib/components/git/repositoryBehaviour.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    export let show = false;
    export let func: Models.Function;
    export let callbackState: Record<string, string> = null;

    let repositoryBehaviour: 'new' | 'existing' | undefined = undefined;
    let repositoryName = '';
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let installations = { installations: [], total: 0 };
    let error = '';

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';
        if (!!installations?.total) {
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

            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject.functions.update(
                func.$id,
                func.name,
                func.runtime,
                func.execute || undefined,
                func.events || undefined,
                func.schedule || undefined,
                func.timeout || undefined,
                func.enabled || undefined,
                func.logging || undefined,
                func.entrypoint,
                func.commands || undefined,
                func.scopes || undefined,
                selectedInstallationId,
                selectedRepository,
                'main',
                undefined,
                undefined,
                undefined
            );
            await invalidate(Dependencies.FUNCTION);
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
        Connect your function to an existing repository or create a new one.
    </span>
    {#if !!installations?.total}
        <Layout.Stack gap="xl">
            <RepositoryBehaviour bind:repositoryBehaviour />
            {#if repositoryBehaviour === 'new'}
                <NewRepository
                    bind:repositoryName
                    bind:repositoryPrivate
                    bind:selectedInstallationId
                    {installations} />
            {:else}
                <Repositories
                    bind:selectedRepository
                    action="button"
                    {callbackState}
                    connect={(e) => {
                        trackEvent(Click.ConnectRepositoryClick, {
                            from: 'functions'
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
