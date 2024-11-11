<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputChoice, InputRadio, InputSelect, InputText } from '$lib/elements/forms';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import Repositories from '$lib/components/repositories.svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent } from '$lib/actions/analytics';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';

    export let show = false;
    export let site: Models.Site;

    let installations = { installations: [], total: 0 };
    let hasInstallations = !!installations?.total;

    let repositoryBehaviour: 'new' | 'existing' = 'new';
    let repositoryName = '';
    let repositoryPrivate = true;
    let selectedInstallationId = '';
    let selectedRepository = '';

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
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site.framework,
                site.enabled,
                site.timeout,
                site.installCommand,
                site.buildCommand,
                site.outputDirectory,
                site.buildRuntime,
                site.serveRuntime,
                selectedInstallationId,
                selectedRepository
            );
            show = false;
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

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!$installation?.$id && installations?.total) {
            console.log('test');
            $installation = installations.installations[0];
        }
        selectedInstallationId = installations.total ? installations.installations[0]?.$id : '';

        console.log(selectedInstallationId);
    });
</script>

<Modal
    title="Create site"
    description="Connect to a new repository or an existing one."
    bind:show
    onSubmit={connectRepo}>
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
                callbackState={{
                    from: 'github',
                    to: 'cover'
                }}
                on:connect={(e) => {
                    trackEvent('click_connect_repository', {
                        from: 'cover'
                    });
                    repository.set(e.detail);
                    repositoryName = e.detail.name;
                    selectedRepository = e.detail.id;
                }} />
        {/if}
    </Layout.Stack>
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
