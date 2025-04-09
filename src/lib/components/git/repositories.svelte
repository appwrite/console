<script lang="ts">
    import { EmptySearch, Paginator } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { repositories } from '$routes/(console)/project-[project]/functions/function-[function]/store';
    import { installation, installations, repository } from '$lib/stores/vcs';
    import {
        Layout,
        Table,
        Typography,
        Icon,
        Avatar,
        Skeleton,
        Button as PinkButton
    } from '@appwrite.io/pink-svelte';
    import { IconLockClosed, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import ConnectGit from './connectGit.svelte';
    import SvgIcon from '../svgIcon.svelte';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { connectGitHub } from '$lib/stores/git';

    let {
        action = $bindable('select'),
        selectedRepository = $bindable(null),
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

    async function loadInstallations() {
        if (installationList) {
            if (installationList.installations.length) {
                selectedInstallation = installationList.installations[0].$id;
                installation.set(
                    installationList.installations.find(
                        (entry) => entry.$id === selectedInstallation
                    )
                );
            }
            return installationList.installations;
        } else {
            const { installations } = await sdk.forProject.vcs.listInstallations();
            if (installations.length) {
                selectedInstallation = installations[0].$id;
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
            //TODO: remove forced cast after backend fixes
            if (product === 'functions') {
                $repositories.repositories = (
                    (await sdk.forProject.vcs.listRepositories(
                        installationId,
                        VCSDetectionType.Runtime,
                        search || undefined
                    )) as unknown as Models.ProviderRepositoryRuntimeList
                ).runtimeProviderRepositories;
            } else {
                $repositories.repositories = (
                    await sdk.forProject.vcs.listRepositories(
                        installationId,
                        VCSDetectionType.Framework,
                        search || undefined
                    )
                ).frameworkProviderRepositories;
            }
        }

        $repositories.search = search;
        $repositories.installationId = installationId;

        if ($repositories.repositories.length && action === 'select') {
            selectedRepository = $repositories.repositories[0].id;
            $repository = $repositories.repositories[0];
        }

        return $repositories.repositories;
    }
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
                        }}
                        bind:value={selectedInstallation} />
                    <InputSearch placeholder="Search repositories" bind:value={search} />
                </Layout.Stack>
            {/await}
        </Layout.Stack>
        {#if selectedInstallation}
            {#await loadRepositories(selectedInstallation, search)}
                <Table.Root columns={1} let:root>
                    {#each Array(4) as _}
                        <Table.Row.Base {root}>
                            <Table.Cell {root}>
                                <Layout.Stack direction="row" alignItems="center">
                                    <Skeleton variant="circle" width={24} />

                                    <Layout.Stack gap="s" direction="row" alignItems="center">
                                        <Skeleton variant="line" width={200} height={20} />
                                    </Layout.Stack>
                                    <Skeleton variant="line" width={76} height={32} />
                                </Layout.Stack>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {:then response}
                {#if response?.length}
                    <Paginator
                        items={response}
                        let:paginatedItems
                        hideFooter={response?.length <= 6}
                        limit={6}>
                        <Table.Root columns={1} let:root>
                            {#each paginatedItems as repo}
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
                                                {#if repo?.framework && repo.framework !== 'other'}
                                                    <Avatar size="xs" alt={repo.name}>
                                                        <SvgIcon
                                                            name={getFrameworkIcon(repo.framework)}
                                                            iconSize="small" />
                                                    </Avatar>
                                                {:else}
                                                    <Avatar size="xs" alt={repo.name} empty />
                                                {/if}
                                            {:else}
                                                {@const iconName = repo?.runtime
                                                    ? repo.runtime.split('-')[0]
                                                    : undefined}
                                                <Avatar size="xs" alt={repo.name} empty={!iconName}>
                                                    <SvgIcon name={iconName} iconSize="small" />
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
                    </Paginator>
                {:else}
                    <EmptySearch hidePages hidePagination bind:search target="repositories">
                        <svelte:fragment slot="actions">
                            {#if search}
                                <Button secondary on:click={() => (search = '')}>
                                    Clear search
                                </Button>
                            {/if}
                        </svelte:fragment>
                    </EmptySearch>
                {/if}
            {/await}
        {/if}
    </Layout.Stack>
{:else}
    <ConnectGit {callbackState} />
{/if}
