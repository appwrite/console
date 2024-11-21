<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputChoice, InputRadio, InputSelect, InputText } from '$lib/elements/forms';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onMount } from 'svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { Repositories } from '$lib/components/git';
    import ConnectGit from '$lib/components/git/connectGit.svelte';
    import { BuildRuntime, Framework, ServeRuntime, type Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const dispatch = createEventDispatcher();

    export let show = false;
    export let site: Models.Site;
    export let callbackState: Record<string, string> = null;

    let repositoryBehaviour: 'new' | 'existing' | undefined = undefined;
    let repositoryName = '';
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';
    let installations = { installations: [], total: 0 };
    let hasInstallations = !!installations?.total;

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';

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
                Framework[site.framework],
                site.enabled,
                site.timeout,
                site.installCommand,
                site.buildCommand,
                site.outputDirectory,
                BuildRuntime[site.buildRuntime],
                ServeRuntime[site.serveRuntime],
                site.fallbackFile,
                selectedInstallationId,
                selectedRepository
            );
            invalidate(Dependencies.SITE);
            show = false;
            dispatch('connect', s);
            addNotification({
                type: 'success',
                message: 'Repository connected successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Modal
    title="Connect repository"
    bind:show
    onSubmit={connectRepo}
    hideFooter={!repositoryBehaviour}>
    <span slot="description"> Connect to a new repository or an existing one. </span>
    {#if hasInstallations}
        <Layout.Stack gap="xl">
            <Layout.Stack direction="row" gap="xl">
                <InputRadio
                    size="s"
                    label="Create new repository"
                    bind:group={repositoryBehaviour}
                    value="new"
                    id="new"
                    name="new" />
                <InputRadio
                    size="s"
                    label="Connect existing repository"
                    bind:group={repositoryBehaviour}
                    value="existing"
                    id="existing"
                    name="existing" />
            </Layout.Stack>
            {#if repositoryBehaviour === 'new'}
                <Layout.Stack gap="l">
                    {#key selectedInstallationId}
                        <InputSelect
                            id="installation"
                            label="Git organization"
                            options={installations.installations.map((entry) => {
                                return {
                                    label: entry.organization,
                                    value: entry.$id
                                };
                            })}
                            on:change={() => {
                                $installation = installations.installations.find(
                                    (entry) => entry.$id === selectedInstallationId
                                );
                            }}
                            bind:value={selectedInstallationId} />
                    {/key}
                    <InputText
                        id="repositoryName"
                        label="Repository name"
                        placeholder="my-repository"
                        bind:value={repositoryName} />
                    <InputChoice
                        id="repositoryPrivate"
                        label="Keep repository private"
                        bind:value={repositoryPrivate} />
                </Layout.Stack>
            {:else}
                <Repositories
                    bind:hasInstallations
                    bind:selectedRepository
                    action="button"
                    {callbackState}
                    on:connect={(e) => {
                        trackEvent('click_connect_repository', {
                            from: 'sites'
                        });
                        repository.set(e.detail);
                        repositoryName = e.detail.name;
                        selectedRepository = e.detail.id;
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
                    Missing a repository? check your permissions <Icon icon={IconArrowSmRight} />
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
