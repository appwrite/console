<script lang="ts">
    import { EmptySearch, Paginator } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { repositories } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
    import { installation, installations, repository } from '$lib/stores/vcs';
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
    import SvgIcon from '../svgIcon.svelte';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { connectGitHub } from '$lib/stores/git';
    import { page } from '$app/state';
    import Card from '../card.svelte';
    import SkeletonRepoList from './skeletonRepoList.svelte';
    import { untrack } from 'svelte';

    let {
        action = $bindable('select'),
        selectedRepository = $bindable(undefined),
        installationList = $bindable($installations),
        hasInstallations = $bindable($installations?.total > 0),
        product = 'functions',
        callbackState = null,
        connect = () => {}
    }: {
        action?: 'button' | 'select';
        selectedRepository?: string;
        installationList?: Models.InstallationList;
        hasInstallations?: boolean;
        product?: 'functions' | 'sites';
        callbackState?: Record<string, string> | null;
        connect?: (repository: Models.ProviderRepository) => void;
    } = $props();

    let search = $state('');
    let selectedInstallation = $state(null);
    let isLoadingRepositories = $state(null);

    async function loadInstallations() {
        if (installationList) {
            if (installationList.installations.length) {
                untrack(() => (selectedInstallation = installationList.installations[0].$id));
                installation.set(
                    installationList.installations.find(
                        (entry) => entry.$id === selectedInstallation
                    )
                );
            }
            return installationList.installations;
        } else {
            const { installations } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listInstallations();
            if (installations.length) {
                untrack(() => (selectedInstallation = installations[0].$id));
                installation.set(installations.find((entry) => entry.$id === selectedInstallation));
            }
            return installations;
        }
    }

    async function loadRepositories(installationId: string, search: string) {
        if (
            !$repositories ||
            $repositories.installationId !== installationId ||
            $repositories.search !== search
        ) {
            await fetchRepos(installationId, search);
        }

        if ($repositories.repositories.length && action === 'select') {
            selectedRepository = $repositories.repositories[0].id;
            $repository = $repositories.repositories[0];
        }
        return $repositories.repositories;
    }

    async function fetchRepos(installationId: string, search: string) {
        if (product === 'functions') {
            $repositories.repositories = (
                (await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.listRepositories(
                        installationId,
                        VCSDetectionType.Runtime,
                        search || undefined
                    )) as unknown as Models.ProviderRepositoryRuntimeList
            ).runtimeProviderRepositories; //TODO: remove forced cast after backend fixes
        } else {
            $repositories.repositories = (
                (await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.listRepositories(
                        installationId,
                        VCSDetectionType.Framework,
                        search || undefined
                    )) as unknown as Models.ProviderRepositoryFrameworkList
            ).frameworkProviderRepositories;
        }

        $repositories.search = search;
        $repositories.installationId = installationId;
    }

    selectedRepository;
</script>

{#if hasInstallations}
    <Layout.Stack>
        <Layout.Stack gap="s">
            {#await loadInstallations()}
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
            {:then installations}
                <Layout.Stack direction="row">
                    <InputSelect
                        id="installation"
                        options={[
                            ...installations.map((entry) => {
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
                            installation.set(
                                installations.find((entry) => entry.$id === selectedInstallation)
                            );

                            isLoadingRepositories = true;
                            loadRepositories(selectedInstallation, search).then(() => {
                                isLoadingRepositories = false;
                            });
                        }}
                        bind:value={selectedInstallation} />
                    <InputSearch
                        placeholder="Search repositories"
                        bind:value={search}
                        disabled={!search && !$repositories?.repositories?.length} />
                </Layout.Stack>
            {/await}
        </Layout.Stack>
        {#if selectedInstallation}
            <!-- manual installation change -->
            {#if isLoadingRepositories}
                <SkeletonRepoList />
            {:else}
                {#await loadRepositories(selectedInstallation, search)}
                    <SkeletonRepoList />
                {:then response}
                    {#if response?.length}
                        <Paginator items={response} hideFooter={response?.length <= 6} limit={6}>
                            {#snippet children(
                                paginatedItems: Models.ProviderRepositoryRuntime[] &
                                    Models.ProviderRepositoryFramework[]
                            )}
                                <Table.Root columns={1} let:root>
                                    {#each paginatedItems as repo}
                                        <Table.Row.Base {root}>
                                            <Table.Cell {root}>
                                                <Layout.Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    gap="s">
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
                                                        {#if repo?.framework && repo.framework !== 'other'}
                                                            <Avatar size="xs" alt={repo.name}>
                                                                <SvgIcon
                                                                    name={getFrameworkIcon(
                                                                        repo.framework
                                                                    )}
                                                                    iconSize="small" />
                                                            </Avatar>
                                                        {:else}
                                                            <Avatar
                                                                size="xs"
                                                                alt={repo.name}
                                                                empty />
                                                        {/if}
                                                    {:else}
                                                        {@const iconName = repo?.runtime
                                                            ? repo.runtime.split('-')[0]
                                                            : undefined}
                                                        <Avatar
                                                            size="xs"
                                                            alt={repo.name}
                                                            empty={!iconName}>
                                                            <SvgIcon
                                                                name={iconName}
                                                                iconSize="small" />
                                                        </Avatar>
                                                    {/if}
                                                    <Layout.Stack
                                                        gap="s"
                                                        direction="row"
                                                        alignItems="center">
                                                        <Typography.Text
                                                            truncate
                                                            color="--fgcolor-neutral-secondary">
                                                            {repo.name}
                                                        </Typography.Text>
                                                        {#if repo.private}
                                                            <Icon
                                                                size="s"
                                                                icon={IconLockClosed}
                                                                color="--fgcolor-neutral-tertiary" />
                                                        {/if}
                                                        <time datetime={repo.pushedAt}>
                                                            <Typography.Caption
                                                                variant="400"
                                                                truncate
                                                                color="--fgcolor-neutral-tertiary">
                                                                {timeFromNow(repo.pushedAt)}
                                                            </Typography.Caption>
                                                        </time>
                                                    </Layout.Stack>
                                                    {#if action === 'button'}
                                                        <Layout.Stack
                                                            direction="row"
                                                            justifyContent="flex-end">
                                                            <PinkButton.Button
                                                                size="xs"
                                                                variant="secondary"
                                                                on:click={() => connect(repo)}>
                                                                Connect
                                                            </PinkButton.Button>
                                                        </Layout.Stack>
                                                    {/if}
                                                </Layout.Stack>
                                            </Table.Cell>
                                        </Table.Row.Base>
                                    {/each}
                                </Table.Root>
                            {/snippet}
                        </Paginator>
                    {:else if search}
                        <EmptySearch hidePages hidePagination bind:search target="repositories">
                            <svelte:fragment slot="actions">
                                {#if search}
                                    <Button secondary on:click={() => (search = '')}>
                                        Clear search
                                    </Button>
                                {/if}
                            </svelte:fragment>
                        </EmptySearch>
                    {:else}
                        <Card>
                            <Layout.Stack alignItems="center" justifyContent="center">
                                <Typography.Text
                                    variation="m-500"
                                    color="--fgcolor-neutral-tertiary">
                                    No repositories available
                                </Typography.Text>
                            </Layout.Stack>
                        </Card>
                    {/if}
                {/await}
            {/if}
        {/if}
    </Layout.Stack>
{:else}
    <ConnectGit {callbackState} />
{/if}
