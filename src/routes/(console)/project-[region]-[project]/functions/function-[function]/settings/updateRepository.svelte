<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Query, Runtime, type Models, type ProjectKeyScopes } from '@appwrite.io/console';
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
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { page } from '$app/state';
    import SelectRootModal from '$lib/components/git/selectRootModal.svelte';

    type Props = {
        func: Models.Function;
        installations: Models.InstallationList;
    };

    let { func, installations }: Props = $props();

    /**
     * Four states, deliberately not three.
     *
     * `disconnected` means the function has no repository. `error` means it has
     * one we could not read. This used to be a single `null` repository, so a
     * repository that could not be fetched rendered as "No repository is
     * connected to this function yet" and invited the user to connect a
     * repository that is already connected. The failure is almost always the
     * Git installation's OAuth token, which is what the user actually has to
     * fix.
     */
    type RepositoryStatus = 'loading' | 'connected' | 'disconnected' | 'error';

    let status = $state<RepositoryStatus>('loading');
    let repository = $state<Models.ProviderRepository | null>(null);
    /** Populated only while `status === 'error'`; never conflated with "no repository". */
    let repositoryError = $state<{
        kind: VcsInstallationErrorKind | null;
        message: string;
    } | null>(null);

    // Seeded from the function once: these are the user's in-progress edits, so
    // they must not silently track the prop while the form is being filled in.
    let selectedBranch = $state(untrack(() => func?.providerBranch));
    let silentMode = $state(untrack(() => func?.providerSilentMode ?? false));
    let selectedDir = $state(untrack(() => func?.providerRootDirectory));
    let showDisconnect = $state(false);
    let showConnectRepo = $state(false);
    let showSelectRoot = $state(false);

    /**
     * The installation the failed lookup actually used, so the alert can name
     * the account that needs reconnecting rather than whichever installation
     * happens to be selected.
     */
    const errorInstallation = $derived(
        installations?.installations?.find((item) => item.$id === func?.installationId) ??
            $installation
    );

    /**
     * The function document stores the provider's repository id but never its
     * name, so this is as much identity as we can show without a successful
     * lookup. Showing it keeps the card honest about still being connected.
     */
    const connectedRepositoryLabel = $derived(
        func?.providerRepositoryId
            ? `Repository ID: ${func.providerRepositoryId}`
            : 'Connected repository'
    );

    const connectedRepositoryDetails = $derived(
        [
            func?.providerBranch ? `Branch: ${func.providerBranch}` : null,
            func?.providerRootDirectory ? `Root directory: ${func.providerRootDirectory}` : null
        ]
            .filter(Boolean)
            .join(' • ')
    );

    onMount(() => {
        selectedBranch = func?.providerBranch;
        silentMode = func?.providerSilentMode ?? false;
        selectedDir = func?.providerRootDirectory;
        const inst = installations?.installations.find((item) => item.$id === func?.installationId);
        installation.set(inst ?? installations?.installations[0]);
        loadRepository();
    });

    async function loadRepository() {
        if (!func?.installationId || !func?.providerRepositoryId) {
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
                    installationId: func.installationId,
                    providerRepositoryId: func.providerRepositoryId
                });
            repository = loaded;
            repositoryStore.set(loaded);
            status = 'connected';
        } catch (error) {
            // The function still points at a repository, so this is not a
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
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime,
                execute: func.execute || undefined,
                events: func.events || undefined,
                schedule: func.schedule || undefined,
                timeout: func.timeout || undefined,
                enabled: func.enabled ?? undefined,
                logging: func.logging ?? undefined,
                entrypoint: func.entrypoint || undefined,
                commands: func.commands || undefined,
                scopes: (func.scopes as ProjectKeyScopes[]) || undefined,
                installationId: func.installationId || undefined,
                providerRepositoryId: func.providerRepositoryId || undefined,
                providerBranch: selectedBranch,
                providerSilentMode: silentMode,
                providerRootDirectory: selectedDir,
                buildSpecification: func.buildSpecification || undefined,
                deploymentRetention: func.deploymentRetention ?? undefined
            });
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: `${func.name} git configuration has been updated successfully`
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

    $effect(() => {
        if (func?.installationId && func?.providerRepositoryId) {
            selectedBranch = func?.providerBranch ?? 'main';
        }
    });

    const isUpdateButtonEnabled = $derived(
        selectedBranch !== func?.providerBranch ||
            silentMode !== func?.providerSilentMode ||
            selectedDir !== func?.providerRootDirectory
    );

    async function connect(selectedInstallationId: string, selectedRepository: string) {
        let nextBranch = func?.providerBranch ?? 'main';
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
                sorted.find((branch) => branch.name === func?.providerBranch)?.name ??
                sorted.find((branch) => branch.name === 'main' || branch.name === 'master')?.name ??
                sorted[0]?.name ??
                nextBranch;

            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime as Runtime,
                execute: func.execute || undefined,
                events: func.events || undefined,
                schedule: func.schedule || undefined,
                timeout: func.timeout || undefined,
                enabled: func.enabled ?? undefined,
                logging: func.logging ?? undefined,
                entrypoint: func.entrypoint,
                commands: func.commands || undefined,
                scopes: (func.scopes as ProjectKeyScopes[]) || undefined,
                installationId: selectedInstallationId,
                providerRepositoryId: selectedRepository,
                providerBranch: nextBranch,
                providerSilentMode: func.providerSilentMode ?? undefined,
                providerRootDirectory: func.providerRootDirectory ?? undefined,
                buildSpecification: func.buildSpecification || undefined,
                deploymentRetention: func.deploymentRetention ?? undefined
            });
            await invalidate(Dependencies.FUNCTION);
        } catch {
            return;
        }
    }
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
                                'This function is still connected to a Git repository, but its details could not be loaded.'}
                            <svelte:fragment slot="actions">
                                <Button compact on:click={loadRepository}>Try again</Button>
                            </svelte:fragment>
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {:else if func.installationId || installations?.total}
                <PinkCard.Base padding="none" border="dashed">
                    <Empty
                        type="secondary"
                        title="No repository is connected to this function yet"
                        description="Connect to enable automatic deployments">
                        <svelte:fragment slot="actions">
                            <Button secondary on:click={() => (showConnectRepo = true)}>
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

{#if showConnectRepo}
    <ConnectRepoModal bind:show={showConnectRepo} {connect} product="functions" />
{/if}

{#if showDisconnect}
    <DisconnectRepo bind:show={showDisconnect} on:success={loadRepository} />
{/if}
{#if showSelectRoot}
    <SelectRootModal
        bind:show={showSelectRoot}
        product="functions"
        bind:rootDir={selectedDir}
        branch={selectedBranch} />
{/if}
