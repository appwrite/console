<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, Query, type Models } from '@appwrite.io/console';
    import { onMount, untrack } from 'svelte';
    import DisconnectRepo from './disconnectRepo.svelte';
    import { installation, repository as repositoryStore, sortBranches } from '$lib/stores/vcs';
    import {
        Alert,
        Empty,
        Fieldset,
        Icon,
        Layout,
        Skeleton,
        Card as PinkCard,
        Selector,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Card from '$lib/components/card.svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import {
        ConnectGit,
        ConnectRepoModal,
        RepositoryCard,
        BranchSelector,
        InstallationError
    } from '$lib/components/git';
    import {
        getVcsInstallationErrorKind,
        type VcsInstallationErrorKind
    } from '$lib/helpers/vcsError';
    import { showConnectRepo } from './store';
    import { page } from '$app/state';
    import SelectRootModal from '$lib/components/git/selectRootModal.svelte';

    type Props = {
        site: Models.Site;
        installations: Models.InstallationList;
    };

    let { site, installations }: Props = $props();

    /**
     * Four states, deliberately not three.
     *
     * `disconnected` means the site has no repository. `error` means it has one
     * we could not read. This used to be a single `null` repository, so a
     * repository that could not be fetched rendered as "No repository is
     * connected to this site yet" and invited the user to connect a repository
     * that is already connected. The failure is almost always the Git
     * installation's OAuth token, which is what the user actually has to fix.
     */
    type RepositoryStatus = 'loading' | 'connected' | 'disconnected' | 'error';

    let status = $state<RepositoryStatus>('loading');
    let repository = $state<Models.ProviderRepository | null>(null);
    /** Populated only while `status === 'error'`; never conflated with "no repository". */
    let repositoryError = $state<{
        kind: VcsInstallationErrorKind | null;
        message: string;
    } | null>(null);

    // Seeded from the site once: these are the user's in-progress edits, so they
    // must not silently track the prop while the form is being filled in.
    let selectedBranch = $state(untrack(() => site?.providerBranch));
    let silentMode = $state(untrack(() => site?.providerSilentMode ?? false));
    let selectedDir = $state(untrack(() => site?.providerRootDirectory));
    let showDisconnect = $state(false);
    let showSelectRoot = $state(false);

    /**
     * The installation the failed lookup actually used, so the alert can name
     * the account that needs reconnecting rather than whichever installation
     * happens to be selected.
     */
    const errorInstallation = $derived(
        installations?.installations?.find((item) => item.$id === site?.installationId) ??
            $installation
    );

    /**
     * The site document stores the provider's repository id but never its name,
     * so this is as much identity as we can show without a successful lookup.
     * Showing it keeps the card honest about still being connected.
     */
    const connectedRepositoryLabel = $derived(
        site?.providerRepositoryId
            ? `Repository ID: ${site.providerRepositoryId}`
            : 'Connected repository'
    );

    const connectedRepositoryDetails = $derived(
        [
            site?.providerBranch ? `Branch: ${site.providerBranch}` : null,
            site?.providerRootDirectory ? `Root directory: ${site.providerRootDirectory}` : null
        ]
            .filter(Boolean)
            .join(' • ')
    );

    onMount(() => {
        const inst = installations?.installations.find((item) => item.$id === site?.installationId);
        installation.set(inst ?? installations?.installations[0]);
        loadRepository();
    });

    async function loadRepository() {
        if (!site?.installationId || !site?.providerRepositoryId) {
            repository = null;
            repositoryError = null;
            status = 'disconnected';
            return;
        }

        status = 'loading';
        repositoryError = null;

        try {
            const loaded = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.getRepository({
                    installationId: site.installationId,
                    providerRepositoryId: site.providerRepositoryId
                });
            repository = loaded;
            repositoryStore.set(loaded);
            status = 'connected';
        } catch (error) {
            // The site still points at a repository, so this is not a
            // disconnection. Report the lookup failure and keep the connection
            // visible instead of blanking the card.
            repository = null;
            repositoryError = {
                kind: getVcsInstallationErrorKind(error),
                message: error?.message ?? ''
            };
            status = 'error';
        }
    }

    async function updateConfiguration() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site?.framework as Framework,
                enabled: site?.enabled ?? undefined,
                logging: site?.logging ?? undefined,
                timeout: site?.timeout || undefined,
                installCommand: site?.installCommand || undefined,
                buildCommand: site?.buildCommand || undefined,
                startCommand: site?.startCommand || undefined,
                outputDirectory: site?.outputDirectory || undefined,
                buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                adapter: site?.adapter as Adapter,
                fallbackFile: site?.fallbackFile || undefined,
                installationId: site?.installationId || undefined,
                providerRepositoryId: site?.providerRepositoryId || undefined,
                providerBranch: selectedBranch || undefined,
                providerSilentMode: silentMode,
                providerRootDirectory: selectedDir || undefined,
                buildSpecification: site?.buildSpecification || undefined,
                deploymentRetention: site?.deploymentRetention ?? undefined
            });
            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message: `${site.name} git configuration has been updated successfully`
            });
            trackEvent(Submit.FunctionUpdateConfiguration);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateConfiguration);
        }
    }

    async function connect(selectedInstallationId: string, selectedRepository: string) {
        let nextBranch = site?.providerBranch ?? 'main';
        try {
            const allBranches = [];
            let offset = 0;
            const limit = 100;
            while (true) {
                const { branches, total } = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.listRepositoryBranches({
                        installationId: selectedInstallationId,
                        providerRepositoryId: selectedRepository,
                        queries: [Query.limit(limit), Query.offset(offset)]
                    });
                allBranches.push(...branches);
                if (allBranches.length >= total || branches.length < limit) break;
                offset += limit;
            }
            const sorted = sortBranches(allBranches);
            nextBranch =
                sorted.find((branch) => branch.name === site?.providerBranch)?.name ??
                sorted.find((branch) => branch.name === 'main' || branch.name === 'master')?.name ??
                sorted[0]?.name ??
                nextBranch;
        } catch {
            // Ignore branch lookup failures; fallback to default.
        }

        await sdk.forProject(page.params.region, page.params.project).sites.update({
            siteId: site.$id,
            name: site.name,
            framework: site.framework as Framework,
            enabled: site?.enabled ?? undefined,
            logging: site?.logging ?? undefined,
            timeout: site?.timeout,
            installCommand: site?.installCommand,
            buildCommand: site?.buildCommand,
            startCommand: site?.startCommand,
            outputDirectory: site?.outputDirectory,
            buildRuntime: site?.buildRuntime as BuildRuntime,
            adapter: site.adapter as Adapter,
            fallbackFile: site?.fallbackFile,
            installationId: selectedInstallationId,
            providerRepositoryId: selectedRepository,
            providerBranch: nextBranch,
            providerSilentMode: site?.providerSilentMode ?? undefined,
            providerRootDirectory: site?.providerRootDirectory ?? undefined,
            buildSpecification: site?.buildSpecification || undefined,
            deploymentRetention: site?.deploymentRetention ?? undefined
        });

        invalidate(Dependencies.SITE);
    }

    $effect(() => {
        if (site?.installationId && site?.providerRepositoryId) {
            selectedBranch = site?.providerBranch ?? 'main';
        }
    });

    const isUpdateButtonEnabled = $derived(
        selectedBranch !== site?.providerBranch ||
            silentMode !== site?.providerSilentMode ||
            selectedDir !== site?.providerRootDirectory
    );
</script>

<Form onSubmit={updateConfiguration}>
    <CardGrid hideFooter={status !== 'connected'}>
        <svelte:fragment slot="title">Git repository</svelte:fragment>
        Automatically deploy changes for every commit pushed to your Git repository.
        <svelte:fragment slot="aside">
            {#if status === 'loading'}
                <Layout.Stack gap="xl">
                    <Card padding="xs" radius="s" variant="secondary">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="xs">
                            <Layout.Stack direction="row" gap="s">
                                <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
                                <Layout.Stack gap="xxxs">
                                    <Skeleton variant="line" width={100} height={20} />
                                    <Skeleton variant="line" width={200} height={15} />
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack>
                    </Card>

                    <Fieldset legend="Branch">
                        <Layout.Stack gap="xl">
                            <Layout.Stack gap="xs">
                                <Skeleton variant="line" width={100} height={20} />
                                <Skeleton variant="line" width="100%" height={32} />
                            </Layout.Stack>
                            <Layout.Stack gap="xs">
                                <Skeleton variant="line" width={100} height={20} />
                                <Skeleton variant="line" width="100%" height={32} />
                            </Layout.Stack>
                            <Layout.Stack gap="xs">
                                <Skeleton variant="line" width={100} height={20} />
                                <Skeleton variant="line" width="100%" height={15} />
                                <Skeleton variant="line" width="100%" height={15} />
                            </Layout.Stack>
                        </Layout.Stack>
                    </Fieldset>
                </Layout.Stack>
            {:else if status === 'connected'}
                <Layout.Stack gap="xl">
                    <RepositoryCard {repository} on:disconnect={() => (showDisconnect = true)} />

                    <Fieldset legend="Branch">
                        <Layout.Stack gap="xl">
                            <BranchSelector
                                bind:value={selectedBranch}
                                installationId={$installation?.$id}
                                repositoryId={repository?.id?.toString()}
                                on:select={(e) => (selectedBranch = e.detail)} />
                            <Layout.Stack direction="row" gap="s" alignItems="flex-end">
                                <InputText
                                    id="root"
                                    label="Root directory"
                                    placeholder="Select directory"
                                    bind:value={selectedDir} />
                                <Button secondary size="s" on:click={() => (showSelectRoot = true)}
                                    >Select</Button>
                            </Layout.Stack>

                            <Selector.Checkbox
                                size="s"
                                id="silentMode"
                                label="Silent mode"
                                description="If selected, comments will not be created when pushing changes to this repository."
                                bind:checked={silentMode} />
                        </Layout.Stack>
                    </Fieldset>
                </Layout.Stack>
            {:else if status === 'error'}
                <Layout.Stack gap="xl">
                    <Card padding="xs" radius="s" variant="secondary">
                        <Layout.Stack direction="row" alignItems="flex-start" gap="s">
                            <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
                            <Layout.Stack gap="xxxs">
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                    {connectedRepositoryLabel}
                                </Typography.Text>
                                {#if connectedRepositoryDetails}
                                    <Typography.Caption
                                        variant="400"
                                        color="--fgcolor-neutral-tertiary">
                                        {connectedRepositoryDetails}
                                    </Typography.Caption>
                                {/if}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Card>

                    {#if repositoryError?.kind}
                        <InstallationError
                            kind={repositoryError.kind}
                            provider={errorInstallation?.provider}
                            organization={errorInstallation?.organization}
                            onRetry={loadRepository} />
                    {:else}
                        <Alert.Inline
                            status="warning"
                            title="Could not load the connected repository">
                            {repositoryError?.message ||
                                'This site is still connected to a Git repository, but its details could not be loaded.'}
                            <svelte:fragment slot="actions">
                                <Button compact on:click={loadRepository}>Try again</Button>
                            </svelte:fragment>
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {:else if site.installationId || installations?.total}
                <PinkCard.Base padding="none" border="dashed">
                    <Empty
                        type="secondary"
                        title="No repository is connected to this site yet"
                        description="Connect to enable automatic deployments">
                        <svelte:fragment slot="actions">
                            <Button secondary on:click={() => showConnectRepo.set(true)}>
                                <Icon icon={IconGithub} size="s" slot="start" />
                                Connect Git repository
                            </Button>
                        </svelte:fragment>
                    </Empty>
                </PinkCard.Base>
            {:else}
                <ConnectGit callbackState={{ newInstallation: 'true' }} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

{#if $showConnectRepo}
    <ConnectRepoModal bind:show={$showConnectRepo} {connect} product="sites" />
{/if}

{#if showDisconnect}
    <DisconnectRepo bind:show={showDisconnect} {site} on:success={loadRepository} />
{/if}

{#if showSelectRoot}
    <SelectRootModal
        bind:show={showSelectRoot}
        product="sites"
        bind:rootDir={selectedDir}
        branch={selectedBranch} />
{/if}
