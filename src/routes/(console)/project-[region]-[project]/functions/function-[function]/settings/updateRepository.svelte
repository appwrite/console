<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Runtime, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import DisconnectRepo from './disconnectRepo.svelte';
    import { installation, repository as repositoryStore, sortBranches } from '$lib/stores/vcs';
    import {
        Empty,
        Fieldset,
        Icon,
        Layout,
        Skeleton,
        Card as PinkCard,
        Input,
        Selector
    } from '@appwrite.io/pink-svelte';
    import Card from '$lib/components/card.svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { ConnectGit, ConnectRepoModal, RepositoryCard } from '$lib/components/git';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { page } from '$app/state';
    import SelectRootModal from '$lib/components/git/selectRootModal.svelte';

    export let func: Models.Function;
    export let installations: Models.InstallationList;

    let branchesList: Models.BranchList;
    let selectedBranch = func?.providerBranch;
    let silentMode = func?.providerSilentMode ?? false;
    let selectedDir = func?.providerRootDirectory;
    let showDisconnect = false;
    let showConnectRepo = false;
    let showSelectRoot = false;
    let repository: Models.ProviderRepository | null | false = false;

    onMount(() => {
        selectedBranch = func?.providerBranch;
        silentMode = func?.providerSilentMode ?? false;
        selectedDir = func?.providerRootDirectory;
        const inst = installations?.installations.find(
            (installation) => installation.$id === func?.installationId
        );
        installation.set(inst ?? installations?.installations[0]);
        loadRepository();
    });

    async function loadRepository() {
        try {
            if (func.installationId && func.providerRepositoryId) {
                repository = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.getRepository(func.installationId, func.providerRepositoryId);
                repositoryStore.set(repository);
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
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.update(
                    func.$id,
                    func.name,
                    func.runtime,
                    func.execute || undefined,
                    func.events || undefined,
                    func.schedule || undefined,
                    func.timeout || undefined,
                    func.enabled || undefined,
                    func.logging || undefined,
                    func.entrypoint || undefined,
                    func.commands || undefined,
                    func.scopes || undefined,
                    func.installationId || undefined,
                    func.providerRepositoryId || undefined,
                    selectedBranch,
                    silentMode,
                    selectedDir
                );
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
    async function getBranches(installation: string, repo: string) {
        branchesList = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.listRepositoryBranches(installation, repo);
        branchesList.branches = sortBranches(branchesList.branches);

        selectedBranch = func?.providerBranch ?? branchesList.branches[0].name;
    }

    $: if (func?.installationId && func?.providerRepositoryId) {
        getBranches(func.installationId, func.providerRepositoryId);
    }

    $: isUpdateButtonEnabled =
        selectedBranch !== func?.providerBranch ||
        silentMode !== func?.providerSilentMode ||
        selectedDir !== func?.providerRootDirectory;

    async function connect(selectedInstallationId: string, selectedRepository: string) {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.update(
                    func.$id,
                    func.name,
                    func.runtime as Runtime,
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
        } catch (error) {
            console.log(error);
        }
    }
</script>

<Form onSubmit={updateConfiguration}>
    <CardGrid hideFooter={!repository}>
        <svelte:fragment slot="title">Git repository</svelte:fragment>
        Automatically deploy changes for every commit pushed to your Git repository.
        <svelte:fragment slot="aside">
            {#if repository === false}
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
            {:else if repository}
                <Layout.Stack gap="xl">
                    <RepositoryCard {repository} on:disconnect={() => (showDisconnect = true)} />
                    <Fieldset legend="Branch">
                        <Layout.Stack gap="xl">
                            <Input.ComboBox
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
    <SelectRootModal bind:show={showSelectRoot} product="sites" bind:rootDir={selectedDir} />
{/if}
