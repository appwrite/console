<script lang="ts">
    import { EmptySearch, PaginationInline } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { repositories } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
    import { installation, installations, repository } from '$lib/stores/vcs';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        Layout,
        Table,
        Typography,
        Icon,
        Avatar,
        Button as PinkButton
    } from '@appwrite.io/pink-svelte';
    import { IconLockClosed, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import ConnectGit from './connectGit.svelte';
    import InstallationError from './installationError.svelte';
    import {
        getVcsInstallationErrorKind,
        type VcsInstallationErrorKind
    } from '$lib/helpers/vcsError';
    import SvgIcon from '../svgIcon.svelte';
    import { Query, VCSDetectionType, type Models } from '@appwrite.io/console';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { connectGitHub } from '$lib/stores/git';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/state';
    import Card from '../card.svelte';
    import SkeletonRepoList from './skeletonRepoList.svelte';
    import { onMount, untrack, onDestroy } from 'svelte';
    import { debounce } from '$lib/helpers/debounce';

    let {
        action = $bindable('select'),
        selectedRepository = $bindable(undefined),
        installationList = $bindable($installations),
        hasInstallations = $bindable($installations?.total > 0),
        product = 'functions',
        callbackState = null,
        installationErrorKind = $bindable(null),
        connect = () => {}
    }: {
        action?: 'button' | 'select';
        selectedRepository?: string;
        installationList?: Models.InstallationList;
        hasInstallations?: boolean;
        product?: 'functions' | 'sites';
        callbackState?: Record<string, string> | null;
        /**
         * Read only output: set when the repository list failed because of the
         * installation itself rather than because it is empty. Bind to it to
         * hide surrounding copy that would be wrong while it is set, such as a
         * "missing a repository? check your permissions" hint, which sends the
         * user to fix scopes when the real problem is a dead token.
         */
        installationErrorKind?: VcsInstallationErrorKind | null;
        connect?: (repository: Models.ProviderRepository) => void;
    } = $props();

    let search = $state('');
    let selectedInstallation = $state(null);
    let isLoadingRepositories = $state(null);
    let installationsMap = $state(null);
    let offset = $state(0);
    let connectingRepositoryId = $state<string | null>(null);
    let loadRepositoriesRequestId = 0;
    const limit = 5;

    // The installation the list is currently showing, so a failure can name the
    // provider and owner the user has to go and reconnect.
    const activeInstallation = $derived(
        installationsMap?.find((entry) => entry.$id === selectedInstallation)
    );

    onMount(() => {
        isLoadingRepositories = true;
        loadInstallations();
    });

    const debouncedLoadRepositories = debounce(
        async (installationId: string, searchTerm: string) => {
            isLoadingRepositories = true;
            try {
                await loadRepositories(installationId, searchTerm);
            } finally {
                isLoadingRepositories = false;
            }
        },
        300
    );

    const loadRepositoryPage = async () => {
        isLoadingRepositories = true;
        try {
            await loadRepositories(selectedInstallation, search);
        } finally {
            isLoadingRepositories = false;
        }
    };

    $effect(() => {
        if (selectedInstallation && search !== undefined) {
            offset = 0; // reset offset to 0 when search changes
            debouncedLoadRepositories(selectedInstallation, search);
        }
    });

    onDestroy(() => {
        debouncedLoadRepositories.cancel();
    });

    async function loadInstallations() {
        if (installationList) {
            if (installationList.installations.length) {
                if (!selectedInstallation) {
                    untrack(() => (selectedInstallation = installationList.installations[0].$id));
                }
                installation.set(
                    installationList.installations.find(
                        (entry) => entry.$id === selectedInstallation
                    )
                );
            }
            installationsMap = installationList.installations;
            return;
        }

        try {
            const { installations } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listInstallations();
            if (installations.length) {
                if (!selectedInstallation) {
                    untrack(() => (selectedInstallation = installations[0].$id));
                }
                installation.set(installations.find((entry) => entry.$id === selectedInstallation));
            }
            installationsMap = installations;
        } catch (error) {
            // Without this the disabled "Loading..." placeholder below never
            // resolves, which reads as a hung UI rather than a failed request.
            installationsMap = [];
            isLoadingRepositories = false;
            addNotification({
                type: 'error',
                message: error?.message ?? 'Failed to load Git installations'
            });
        }
    }

    async function loadRepositories(installationId: string, search: string) {
        const requestId = ++loadRepositoriesRequestId;
        installationErrorKind = null;

        try {
            const result = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositories({
                    installationId,
                    type:
                        product === 'functions'
                            ? VCSDetectionType.Runtime
                            : VCSDetectionType.Framework,
                    search: search || undefined,
                    queries: [Query.limit(limit), Query.offset(offset)]
                });

            // Stale request
            if (requestId !== loadRepositoriesRequestId) {
                return;
            }

            $repositories.repositories =
                product === 'functions'
                    ? (result as unknown as Models.ProviderRepositoryRuntimeList)
                          .runtimeProviderRepositories
                    : (result as unknown as Models.ProviderRepositoryFrameworkList)
                          .frameworkProviderRepositories; //TODO: remove forced cast after backend fixes
            $repositories.total = result.total;
            $repositories.search = search;
            $repositories.installationId = installationId;
            return $repositories.repositories;
        } catch (error) {
            // Stale request
            if (requestId !== loadRepositoriesRequestId) {
                return;
            }

            const kind = getVcsInstallationErrorKind(error);
            if (kind) {
                // Drop the previous page only when something replaces it.
                // Rendered in the list position, so the empty state never gets
                // a chance to claim the installation simply has no repositories.
                $repositories.repositories = [];
                $repositories.total = 0;
                $repositories.search = search;
                $repositories.installationId = installationId;
                installationErrorKind = kind;
                return;
            }

            // Any other failure only gets a toast, so keep the previous page
            // rather than swapping it for a bare "no repositories found".
            addNotification({
                type: 'error',
                message: error?.message ?? 'Failed to load repositories'
            });
        }
    }

    selectedRepository;
</script>

{#if hasInstallations}
    <Layout.Stack>
        <Layout.Stack gap="s">
            {#if !installationsMap}
                <Layout.Stack direction="row">
                    <InputSelect
                        disabled
                        id="installation"
                        options={[
                            {
                                label: 'Loading...',
                                value: null
                            }
                        ]}
                        value={null} />
                    <InputSearch placeholder="Search repositories" disabled />
                </Layout.Stack>
            {:else}
                <Layout.Stack direction={$isSmallViewport ? 'column' : 'row'}>
                    <InputSelect
                        id="installation"
                        options={[
                            ...installationsMap.map((entry) => {
                                return {
                                    label: entry.organization,
                                    value: entry.$id
                                };
                            }),
                            {
                                label: 'Add installation',
                                leadingIcon: IconPlus,
                                value: 'new'
                            }
                        ]}
                        on:change={() => {
                            if (selectedInstallation === 'new') {
                                window.location.href = connectGitHub(callbackState).toString();
                            }
                            search = '';
                            // A different installation has its own health, so
                            // clear immediately instead of leaving the previous
                            // one's error up for the debounce window.
                            installationErrorKind = null;
                            installation.set(
                                installationsMap.find((entry) => entry.$id === selectedInstallation)
                            );

                            debouncedLoadRepositories.cancel();
                        }}
                        bind:value={selectedInstallation} />
                    <InputSearch placeholder="Search repositories" bind:value={search} />
                </Layout.Stack>
            {/if}
        </Layout.Stack>
        {#if selectedInstallation}
            <!-- manual installation change -->
            {#if isLoadingRepositories}
                <SkeletonRepoList count={limit} />
            {:else if installationErrorKind}
                <InstallationError
                    kind={installationErrorKind}
                    provider={activeInstallation?.provider}
                    organization={activeInstallation?.organization}
                    onRetry={loadRepositoryPage} />
            {:else if $repositories.total > 0}
                <Table.Root columns={1} let:root>
                    {#each $repositories.repositories as repo}
                        <Table.Row.Base {root}>
                            <Table.Cell {root}>
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    {#if action === 'select'}
                                        <input
                                            class="is-small u-margin-inline-end-8"
                                            type="radio"
                                            name="repositories"
                                            bind:group={selectedRepository}
                                            onchange={() => repository.set(repo)}
                                            value={repo.id} />
                                    {/if}
                                    {#if product === 'sites'}
                                        {#if 'framework' in repo && repo?.framework && repo.framework !== 'other'}
                                            <Avatar size="xs" alt={repo.name}>
                                                <SvgIcon
                                                    name={getFrameworkIcon(repo.framework)}
                                                    iconSize="small" />
                                            </Avatar>
                                        {:else}
                                            <Avatar size="xs" alt={repo.name} empty />
                                        {/if}
                                    {:else}
                                        {@const iconName =
                                            'runtime' in repo && repo?.runtime
                                                ? repo.runtime.split('-')[0]
                                                : undefined}
                                        <Avatar size="xs" alt={repo.name} empty={!iconName}>
                                            {#if iconName}
                                                <SvgIcon name={iconName} iconSize="small" />
                                            {/if}
                                        </Avatar>
                                    {/if}
                                    <Layout.Stack
                                        direction="row"
                                        alignItems="center"
                                        gap="s"
                                        style="flex: 1; min-width: 0;">
                                        <Typography.Text
                                            truncate
                                            color="--fgcolor-neutral-secondary"
                                            style="flex: 1; min-width: 0;">
                                            {repo.name}
                                        </Typography.Text>
                                        {#if repo.private}
                                            <Icon
                                                size="s"
                                                icon={IconLockClosed}
                                                color="--fgcolor-neutral-tertiary" />
                                        {/if}
                                        {#if !$isSmallViewport}
                                            <time datetime={repo.pushedAt}>
                                                <Typography.Caption
                                                    variant="400"
                                                    truncate
                                                    color="--fgcolor-neutral-tertiary">
                                                    {timeFromNow(repo.pushedAt)}
                                                </Typography.Caption>
                                            </time>
                                        {/if}
                                    </Layout.Stack>
                                    {#if action === 'button'}
                                        <PinkButton.Button
                                            size="xs"
                                            variant="secondary"
                                            style="flex-shrink: 0;"
                                            disabled={!!connectingRepositoryId}
                                            on:click={async () => {
                                                connectingRepositoryId = repo.id;
                                                try {
                                                    await Promise.resolve(connect(repo));
                                                } catch (error) {
                                                    addNotification({
                                                        type: 'error',
                                                        message:
                                                            error?.message ??
                                                            'Failed to connect repository'
                                                    });
                                                } finally {
                                                    connectingRepositoryId = null;
                                                }
                                            }}>
                                            Connect
                                        </PinkButton.Button>
                                    {/if}
                                </Layout.Stack>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {:else if search}
                <EmptySearch hidePages hidePagination bind:search target="repositories">
                    <svelte:fragment slot="actions">
                        {#if search}
                            <Button secondary on:click={() => (search = '')}>Clear search</Button>
                        {/if}
                    </svelte:fragment>
                </EmptySearch>
            {:else}
                <Card>
                    <Layout.Stack alignItems="center" justifyContent="center">
                        <Typography.Text variation="m-500" color="--fgcolor-neutral-tertiary">
                            No repositories available
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
            {/if}

            {#if isLoadingRepositories || $repositories.total > 0}
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    wrap="wrap">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        Total results: {$repositories.total}
                    </Typography.Text>
                    <PaginationInline
                        {limit}
                        bind:offset
                        total={isLoadingRepositories ? 0 : $repositories.total}
                        hidePages={true}
                        on:change={loadRepositoryPage} />
                </Layout.Stack>
            {/if}
        {/if}
    </Layout.Stack>
{:else}
    <ConnectGit {callbackState} />
{/if}
