<script context="module" lang="ts">
    export function sortBranches(branches: Models.Branch[]) {
        return branches.sort((a, b) => {
            if (a.name === 'main' || a.name === 'master') {
                return -1;
            }

            return a.name > b.name ? 1 : -1;
        });
    }
</script>

<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        Alert,
        AvatarGroup,
        Box,
        CardGrid,
        Collapsible,
        CollapsibleItem,
        EyebrowHeading,
        Heading,
        SvgIcon
    } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputChoice,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Runtime, type Models } from '@appwrite.io/console';
    import { func } from '../store';
    import GitInstallationModal from '$routes/(console)/project-[project]/settings/GitInstallationModal.svelte';
    import GitConfigurationModal from './gitConfigurationModal.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { onMount } from 'svelte';
    import DisconnectRepo from './disconnectRepo.svelte';
    import { Pill } from '$lib/elements';
    import { wizard } from '$lib/stores/wizard';
    import ConnectExisting from '$lib/wizards/functions/connectExisting.svelte';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';
    import { installations } from '$lib/wizards/functions/store';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    const functionId = $page.params.function;
    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;

    let entrypoint: string;
    let commands: string;
    let showGit = false;
    let branchesList: Models.BranchList;
    let selectedBranch: string;
    let silentMode = false;
    let selectedDir: string;
    let showDisconnect = false;

    let repository: Models.ProviderRepository | null | false = false;

    onMount(() => {
        entrypoint = $func?.entrypoint;
        commands = $func?.commands;
        selectedBranch = $func?.providerBranch;
        silentMode = $func?.providerSilentMode ?? false;
        selectedDir = $func?.providerRootDirectory;

        if ($page.url.searchParams.has('github-installed')) {
            wizard.start(ConnectExisting);
        }

        loadRepository();
    });

    async function loadRepository() {
        try {
            if ($func.installationId && $func.providerRepositoryId) {
                repository = await sdk.forProject.vcs.getRepository(
                    $func.installationId,
                    $func.providerRepositoryId
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

    enum ProviderNames {
        github = 'GitHub',
        gitlab = 'GitLab',
        bitBucket = 'BitBucket',
        azure = 'Azure'
    }

    function getRepositoryLink(repository: Models.ProviderRepository) {
        switch (repository.provider) {
            case 'github':
                return `https://github.com/${repository.organization}/${repository.name}`;
            default:
                return '';
        }
    }

    async function updateConfiguration() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.runtime,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled || undefined,
                $func.logging || undefined,
                entrypoint,
                commands,
                $func.scopes || undefined,
                $func.installationId || undefined,
                $func.providerRepositoryId || undefined,
                selectedBranch,
                silentMode,
                selectedDir,
                $func.specification || undefined
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: `${$func.name} git configuration has been updated successfully`
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

        selectedBranch = $func?.providerBranch ?? branchesList.branches[0].name;
    }

    $: if ($func?.installationId && $func?.providerRepositoryId) {
        getBranches($func.installationId, $func.providerRepositoryId);
    }

    $: isUpdateButtonEnabled =
        entrypoint !== $func?.entrypoint ||
        commands !== $func?.commands ||
        selectedBranch !== $func?.providerBranch ||
        silentMode !== $func?.providerSilentMode ||
        selectedDir !== $func?.providerRootDirectory;
</script>

<Form onSubmit={updateConfiguration}>
    <CardGrid>
        <Heading tag="h6" size="7">Configuration</Heading>
        <p class="text">
            Connect a Git repository for automatic deployments, or set install and build commands
            for your function.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    required
                    hideRequired
                    label="Entrypoint"
                    id="Entrypoint"
                    placeholder="Enter an entrypoint (e.g. 'index.js')"
                    bind:value={entrypoint} />
            </FormList>
            <Collapsible>
                {#if repository === false}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            <span class="u-margin-inline-end-16">Git settings</span>
                        </svelte:fragment>
                        <div class="card-git card is-border-dashed is-no-shadow common-section">
                            <div class="u-flex u-gap-8 u-cross-center u-main-center">
                                <div class="loader u-margin-16" />
                                Loading repository...
                            </div>
                        </div>
                    </CollapsibleItem>
                {:else}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            <span class="u-margin-inline-end-16">Git settings</span>
                            {#if !repository}
                                <Pill>
                                    <EyebrowHeading tag="h6" size="3" style="line-height: unset">
                                        NOT CONNECTED
                                    </EyebrowHeading>
                                </Pill>
                            {/if}
                        </svelte:fragment>
                        {#if repository}
                            <Box radius="small">
                                <div class="u-flex u-gap-8">
                                    <SvgIcon name={repository.provider} iconSize="xlarge" />
                                    <div class="u-line-height-1-5">
                                        <h6 class="u-bold u-trim-1">
                                            {repository.name}
                                            {#if repository.private}
                                                <span
                                                    class="icon-lock-closed u-color-text-gray"
                                                    style="font-size: var(--icon-size-small)"
                                                    aria-hidden="true" />
                                            {/if}
                                        </h6>
                                        <p class="u-color-text-gray">
                                            Last updated: {toLocaleDateTime(repository.pushedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div class="u-margin-block-start-24">
                                    <FormList>
                                        <InputSelectSearch
                                            required={true}
                                            id="branch"
                                            label="Branch"
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
                                        <InputText
                                            id="root"
                                            label="Root directory"
                                            placeholder="functions/my-function"
                                            bind:value={selectedDir} />
                                        <InputChoice
                                            id="silent"
                                            label="Silent mode"
                                            tooltip="Don't create comments when pushing to this repository"
                                            bind:value={silentMode} />
                                    </FormList>
                                </div>
                                <div
                                    class="u-margin-block-start-24 u-flex u-gap-16 u-main-end u-flex-wrap">
                                    <Button text on:click={() => (showDisconnect = true)}>
                                        Disconnect repository
                                    </Button>
                                    <Button secondary href={getRepositoryLink(repository)} external>
                                        View on {ProviderNames[repository.provider] ??
                                            'unknown provider'}
                                        <span class="icon-external-link" />
                                    </Button>
                                </div>
                            </Box>
                        {:else}
                            {#if isSelfHosted && !isVcsEnabled}
                                <Alert class="common-section" type="info">
                                    <svelte:fragment slot="title">
                                        Installing Git to a self-hosted instance
                                    </svelte:fragment>
                                    When installing Git in a locally hosted Appwrite project, you must
                                    first configure your environment variables.
                                    <svelte:fragment slot="buttons">
                                        <Button
                                            href="https://appwrite.io/docs/advanced/self-hosting/functions"
                                            external
                                            text>
                                            Learn more
                                        </Button>
                                    </svelte:fragment>
                                </Alert>
                            {/if}
                            <article
                                class="card-git card is-border-dashed is-no-shadow common-section">
                                <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                                    <div class="u-flex u-cross-center u-gap-8">
                                        <AvatarGroup
                                            bordered
                                            icons={['github', 'gitlab', 'bitBucket', 'azure']} />

                                        <span class="icon-arrow-narrow-right" />
                                        <div class="avatar">
                                            <SvgIcon
                                                name={$func.runtime.split('-')[0]}
                                                type="grayscale"
                                                size={80} />
                                        </div>
                                    </div>
                                    <Button
                                        secondary
                                        disabled={isSelfHosted && !isVcsEnabled}
                                        on:click={() => wizard.start(ConnectExisting)}>
                                        <span class="text">Connect Git</span>
                                    </Button>
                                </div>
                            </article>
                        {/if}
                    </CollapsibleItem>
                {/if}
                <CollapsibleItem>
                    <svelte:fragment slot="title">Build settings</svelte:fragment>
                    <FormList>
                        <InputTextarea
                            label="Commands"
                            placeholder="Enter an install command (e.g. 'npm install')"
                            id="install"
                            tooltip="Enter a single command or chain multiple commands with the && operator"
                            bind:value={commands} />
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

{#if !$installations?.total && showGit}
    <GitInstallationModal bind:showGitInstall={showGit} />
{:else}
    <GitConfigurationModal bind:show={showGit} />
{/if}

<DisconnectRepo bind:show={showDisconnect} on:success={loadRepository} />
