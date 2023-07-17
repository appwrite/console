<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarGroup, CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputChoice,
        InputSelect,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { func } from '../store';
    import GitInstallationModal from '$routes/console/project-[project]/settings/GitInstallationModal.svelte';
    import GitConfigurationModal from './gitConfigurationModal.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { onMount } from 'svelte';
    import DisconnectRepo from './disconnectRepo.svelte';
    import { Pill } from '$lib/elements';
    import { wizard } from '$lib/stores/wizard';
    import ConnectExisting from '$lib/wizards/functions/connectExisting.svelte';

    export let installations: Models.InstallationList;
    export let repository: Models.Repository | null;
    const functionId = $page.params.function;

    let entrypoint: string;
    let installCmd: string;
    let buildCmd: string;
    let showGit = false;
    let branchesList: Models.BranchList;
    let selectedBranch: string;
    let silentMode = false;
    let selectedDir: string;
    let showDisconnect = false;

    onMount(() => {
        entrypoint = $func?.entrypoint;
        installCmd = $func?.installCommand;
        buildCmd = $func?.buildCommand;
        selectedBranch = $func?.vcsBranch;
        silentMode = $func?.vcsSilentMode ?? false;
        selectedDir = $func?.vcsRootDirectory;

        if ($page.url.searchParams.has('github-installed')) {
            wizard.start(ConnectExisting);
        }
    });

    enum ProviderNames {
        github = 'GitHub',
        gitlab = 'GitLab',
        bitBucket = 'BitBucket'
    }

    function getProviderIcon(provider: string) {
        switch (provider) {
            case 'github':
                return 'icon-github';
            default:
                return '';
        }
    }

    function getRepositoryLink(repository: Models.Repository) {
        switch (repository.provider) {
            case 'github':
                return `https://github.com/${repository.organization}/${repository.name}`;
            default:
                return '';
        }
    }

    async function updateConfiguration() {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                entrypoint,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled,
                $func.logging,
                buildCmd,
                installCmd,
                $func.vcsInstallationId,
                $func.vcsRepositoryId,
                selectedBranch,
                silentMode,
                selectedDir
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
        branchesList.branches = branchesList.branches.sort((a, b) => {
            if (a.name === 'main' || a.name === 'master') {
                return -1;
            }

            return a.name > b.name ? -1 : 1;
        });

        selectedBranch = $func?.vcsBranch ?? branchesList.branches[0].name;
    }

    $: if ($func?.vcsInstallationId && $func?.vcsRepositoryId) {
        getBranches($func.vcsInstallationId, $func.vcsRepositoryId);
    }

    $: isUpdateButtonEnabled =
        entrypoint !== $func?.entrypoint ||
        installCmd !== $func?.installCommand ||
        buildCmd !== $func?.buildCommand ||
        selectedBranch !== $func?.vcsBranch ||
        silentMode !== $func?.vcsSilentMode ||
        selectedDir !== $func?.vcsRootDirectory;
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
                    label="Entrypoint"
                    id="Entrypoint"
                    placeholder="Enter an entrypoint (e.g. 'index.js')"
                    bind:value={entrypoint} />
            </FormList>
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">
                        <span class="u-margin-inline-end-16">Git settings</span>
                        {#if !repository}
                            <Pill>NOT CONNECTED</Pill>
                        {/if}
                    </svelte:fragment>
                    {#if repository}
                        <div class="box" style:--box-border-radius="var(--border-radius-small)">
                            <div class="u-flex u-gap-16">
                                <div class="avatar is-size-x-small">
                                    <span class={getProviderIcon(repository.provider)} />
                                </div>
                                <div class="u-cross-child-center u-line-height-1-5">
                                    <h6 class="u-bold u-trim-1">{repository.name}</h6>
                                    <p>Last updated: {toLocaleDateTime(repository.pushedAt)}</p>
                                </div>
                            </div>
                            <div class="u-margin-block-start-24">
                                <FormList>
                                    <InputSelect
                                        id="branch"
                                        label="Branch"
                                        options={branchesList?.branches?.map((branch) => {
                                            return {
                                                value: branch.name,
                                                label: branch.name
                                            };
                                        }) ?? []}
                                        bind:value={selectedBranch} />
                                    <InputText
                                        id="root"
                                        label="Root directory"
                                        bind:value={selectedDir} />
                                    <InputChoice
                                        id="silent"
                                        label="Silent mode"
                                        tooltip="Don't create comments when pushing to this repository"
                                        bind:value={silentMode} />
                                </FormList>
                            </div>
                            <div class="u-margin-block-start-24 u-flex u-gap-16 u-main-end">
                                <Button text on:click={() => (showDisconnect = true)}
                                    >Disconnect repository</Button>
                                <Button secondary href={getRepositoryLink(repository)} external>
                                    View on {ProviderNames[repository.provider] ??
                                        'unknown provider'}
                                    <span class="icon-external-link" />
                                </Button>
                            </div>
                        </div>
                    {:else}
                        <article class="card-git card is-border-dashed is-no-shadow">
                            <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                                <div class="u-flex u-cross-center u-gap-8">
                                    <AvatarGroup icons={['github', 'gitlab', 'bitBucket']} />

                                    <span class="icon-arrow-narrow-right" />

                                    <div class="avatar"><span class="icon-server" /></div>
                                </div>
                                <Button secondary on:click={() => wizard.start(ConnectExisting)}>
                                    <span class="text">Connect Git</span>
                                </Button>
                            </div>
                        </article>
                    {/if}
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Build settings</svelte:fragment>
                    <FormList>
                        <InputText
                            label="Install command"
                            placeholder="Enter an install commad (e.g. 'npm install')"
                            id="install"
                            bind:value={installCmd} />
                        <InputText
                            label="Build command"
                            placeholder="Enter a build commad (e.g. 'npm run build')"
                            id="build"
                            bind:value={buildCmd} />
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isUpdateButtonEnabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

{#if !installations?.total && showGit}
    <GitInstallationModal bind:showGitInstall={showGit} />
{:else}
    <GitConfigurationModal bind:show={showGit} installationsList={installations} />
{/if}

<DisconnectRepo bind:show={showDisconnect} />
