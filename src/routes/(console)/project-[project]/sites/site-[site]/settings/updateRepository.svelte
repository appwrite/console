<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputChoice, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { onMount } from 'svelte';
    import DisconnectRepo from './disconnectRepo.svelte';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';
    import { sortBranches } from '$lib/stores/vcs';
    import {
        Empty,
        Fieldset,
        Icon,
        Layout,
        Skeleton,
        Typography,
        Card as PinkCard
    } from '@appwrite.io/pink-svelte';
    import Card from '$lib/components/card.svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { ConnectGit } from '$lib/components/git';
    import ConnectRepoModal from '../../(components)/connectRepoModal.svelte';
    import { showConnectRepo } from './store';

    export let site: Models.Site;
    export let installations: Models.InstallationList;

    let branchesList: Models.BranchList;
    let selectedBranch: string;
    let silentMode = false;
    let selectedDir: string;
    let showDisconnect = false;
    let repository: Models.ProviderRepository | null | false = false;

    onMount(() => {
        selectedBranch = site?.providerBranch;
        silentMode = site?.providerSilentMode ?? false;
        selectedDir = site?.providerRootDirectory;

        loadRepository();
    });

    async function loadRepository() {
        try {
            if (site.installationId && site.providerRepositoryId) {
                repository = await sdk.forProject.vcs.getRepository(
                    site.installationId,
                    site.providerRepositoryId
                );
            }
        } catch (err) {
            console.warn(err);
        } finally {
            if (repository === false) {
                repository = null;
            }
        }
    }

    async function updateConfiguration() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site?.framework as Framework,
                site.enabled || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                site.adapter,
                site.fallbackFile || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                selectedBranch || undefined,
                silentMode || undefined,
                selectedDir || undefined
            );
            await invalidate(Dependencies.FUNCTION);
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

    async function getBranches(installation: string, repo: string) {
        branchesList = await sdk.forProject.vcs.listRepositoryBranches(installation, repo);
        branchesList.branches = sortBranches(branchesList.branches);

        selectedBranch = site?.providerBranch ?? branchesList.branches[0].name;
    }

    $: if (site?.installationId && site?.providerRepositoryId) {
        getBranches(site.installationId, site.providerRepositoryId);
    }

    $: isUpdateButtonEnabled =
        selectedBranch !== site?.providerBranch ||
        silentMode !== site?.providerSilentMode ||
        selectedDir !== site?.providerRootDirectory;
</script>

<Form onSubmit={updateConfiguration}>
    <CardGrid>
        <Heading tag="h6" size="7">Repository</Heading>
        <p class="text">
            Automatically deploy changes for every commit pushed to your Git repository.
        </p>
        <svelte:fragment slot="aside">
            {#if repository === false}
                <Layout.Stack gap="xl">
                    <Card isTile padding="s" radius="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="xs">
                            <Layout.Stack direction="row" gap="s">
                                <Icon size="s" icon={IconGithub} />
                                <Layout.Stack gap="xxs">
                                    <Skeleton variant="line" width={100} height={20} />
                                    <Skeleton variant="line" width={100} height={15} />
                                </Layout.Stack>
                            </Layout.Stack>
                        </Layout.Stack>
                    </Card>

                    <Fieldset legend="Branch">
                        <Layout.Stack gap="l">
                            <Skeleton variant="line" width={300} height={45} />
                            <Skeleton variant="line" width={300} height={45} />
                            <Skeleton variant="line" width={300} height={45} />
                        </Layout.Stack>
                    </Fieldset>
                </Layout.Stack>
            {:else if repository}
                <Layout.Stack gap="xl">
                    <Card isTile padding="s" radius="s">
                        <Layout.Stack direction="row" gap="s">
                            <Layout.Stack direction="row" gap="s">
                                <Icon size="s" icon={IconGithub} />
                                <Layout.Stack gap="none">
                                    <Typography.Text
                                        variant="m-400"
                                        color="--color-fgcolor-accent-neutral">
                                        {repository.name}
                                    </Typography.Text>
                                    Last updated: {toLocaleDateTime(repository.pushedAt)}
                                </Layout.Stack>
                            </Layout.Stack>
                            <Button secondary on:click={() => (showDisconnect = true)}>
                                Disconnect
                            </Button>
                        </Layout.Stack>
                    </Card>

                    <Fieldset legend="Branch">
                        <Layout.Stack gap="l">
                            <InputSelectSearch
                                required={true}
                                id="branch"
                                label="Production branch"
                                placeholder="main"
                                interactiveOutput
                                bind:value={selectedBranch}
                                bind:search={selectedBranch}
                                on:select={(event) => {
                                    selectedBranch = event.detail.value;
                                }}
                                name="branch"
                                options={branchesList?.branches?.map((branch) => {
                                    return {
                                        value: branch.name,
                                        label: branch.name
                                    };
                                }) ?? []} />
                            <Layout.Stack direction="row" gap="s" alignItems="flex-end">
                                <InputText
                                    id="root"
                                    label="Root directory"
                                    placeholder="Select directory"
                                    bind:value={selectedDir} />
                                <Button secondary size="s">Select</Button>
                            </Layout.Stack>
                            <InputChoice
                                id="silentMode"
                                label="Silent mode"
                                bind:value={silentMode} />
                        </Layout.Stack>
                    </Fieldset>
                </Layout.Stack>
            {:else if site.installationId || installations?.total}
                <PinkCard.Base padding="none" border="dashed">
                    <Empty
                        title="No repository is connected to this site yet"
                        description="Connect to enable automatic deployments">
                        <svelte:fragment slot="actions">
                            <Button secondary on:click={() => showConnectRepo.set(true)}>
                                <Icon icon={IconGithub} size="s" />
                                Connect repository
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
    <ConnectRepoModal bind:show={$showConnectRepo} {site} />
{/if}

{#if showDisconnect}
    <DisconnectRepo bind:show={showDisconnect} {site} on:success={loadRepository} />
{/if}
