<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { BoxAvatar, EmptySearch, Modal, PaginationInline } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { InputChoice, InputSearch, InputSelect, InputText, Button } from '$lib/elements/forms';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Runtime, type Models } from '@appwrite.io/console';
    import { func, repositories } from '../store';
    import { invalidate } from '$app/navigation';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';
    import { sortBranches } from './updateConfiguration.svelte';
    import { installations } from '$lib/wizards/functions/store';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    export let show: boolean;

    const functionId = $page.params.function;

    let selectedRepoId: string;
    let selectedInstallationId: string;
    let step = 1;
    let search: string;
    let repositoriesList: Models.ProviderRepository[];
    let branchesList: Models.BranchList;
    let offset = 0;
    let selectedBranch: string;
    let selectedDir: string;
    let silentMode = false;
    let error = '';

    let installationsOptions = $installations.installations.map((installation) => {
        return {
            value: installation.$id,
            label: installation.organization
        };
    });

    function getProviderIcon(provider: string) {
        if (provider === 'github') {
            return `icon-github`;
        }

        return '';
    }

    async function handleSubmit() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.update(
                    functionId,
                    $func.name,
                    $func.runtime,
                    $func.execute || undefined,
                    $func.events || undefined,
                    $func.schedule || undefined,
                    $func.timeout || undefined,
                    $func.enabled || undefined,
                    $func.logging || undefined,
                    $func.entrypoint,
                    $func.commands || undefined,
                    $func.scopes || undefined,
                    selectedInstallationId,
                    selectedRepoId,
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
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FunctionUpdateConfiguration);
        }
    }

    async function getRepos() {
        if (!show || !selectedInstallationId) return;

        if (
            !$repositories ||
            $repositories.installationId !== selectedInstallationId ||
            $repositories.search !== search
        ) {
            $repositories.repositories = (
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .vcs.listRepositories(selectedInstallationId, search || undefined)
            ).providerRepositories;
        }

        $repositories.search = search;
        $repositories.installationId = selectedInstallation.$id;

        repositoriesList = $repositories.repositories;
    }
    async function getBranches() {
        if (!show || !selectedInstallationId) return;
        branchesList = await sdk
            .forProject($page.params.region, $page.params.project)
            .vcs.listRepositoryBranches(selectedInstallationId, selectedRepoId);

        branchesList.branches = sortBranches(branchesList.branches);

        selectedBranch = branchesList?.branches[0].name;
    }

    $: if (search !== null) {
        offset = 0;
        getRepos();
    }

    $: selectedRepo = (repositoriesList ?? []).find((repo) => repo.id === selectedRepoId) ?? null;
    $: selectedInstallation =
        ($installations?.installations ?? []).find(
            (installation) => installation.$id === selectedInstallationId
        ) ?? null;
</script>

<Modal
    title="Git configuration"
    headerDivider={false}
    bind:show
    size="big"
    bind:error
    onSubmit={handleSubmit}>
    <p class="text">
        Configure a Git repository that will trigger your function deployments when updated.
    </p>
    {#if step === 1}
        {#await getRepos()}
            Fetching repositories..
        {:then}
            <div class="u-flex u-gap-16">
                <div class="u-width-full-line">
                    <InputSelect
                        options={installationsOptions}
                        id="installations"
                        label="installation"
                        showLabel={false}
                        bind:value={selectedInstallationId} />
                </div>
                <div class="u-width-full-line">
                    <InputSearch placeholder="Search repositories" bind:value={search} />
                </div>
            </div>

            <p class="text">
                Manage organization configuration in your <a
                    class="link"
                    href={`${base}/project-${$page.params.region}-${$page.params.project}/settings`}
                    >project settings</a
                >.
            </p>
            {#if repositoriesList.length}
                <ul class="table is-remove-outer-styles u-sep-block-start">
                    {#each repositoriesList as repo}
                        <li class="table-row">
                            <label class="table-col u-cursor-pointer">
                                <div class="u-flex u-cross-center u-gap-8">
                                    <input
                                        class="is-small u-margin-inline-end-8"
                                        type="radio"
                                        name="repositories"
                                        bind:group={selectedRepoId}
                                        value={repo.id} />
                                    <div class="avatar is-size-x-small">
                                        <img src="" alt={repo.name} />
                                    </div>
                                    <div class="u-flex u-gap-8">
                                        <span class="text">{repo.name}</span>
                                        {#if repo.private}
                                            <span
                                                class="icon-lock-closed"
                                                style="font-size: var(--icon-size-small)"
                                                aria-hidden="true" />
                                        {/if}
                                        <time class="u-color-text-gray" datetime={repo.pushedAt}>
                                            {timeFromNow(repo.pushedAt)}
                                        </time>
                                    </div>
                                </div>
                            </label>
                        </li>
                    {/each}
                </ul>
                <div class="u-flex u-margin-block-start-32 u-main-space-between">
                    <p class="text">Total results: {repositoriesList.length}</p>
                    <PaginationInline
                        limit={5}
                        bind:offset
                        sum={repositoriesList.length}
                        hidePages />
                </div>
            {:else if search}
                <EmptySearch hidePages>
                    <div class="common-section">
                        <div class="u-text-center common-section">
                            <b class="body-text-2 u-bold">Sorry we couldn't find "{search}"</b>
                            <p>There are no repositories that match your search.</p>
                        </div>
                        <div class="u-flex u-gap-16 common-section u-main-center">
                            <Button
                                external
                                href="https://appwrite.io/docs/products/functions/deployment"
                                text>Documentation</Button>
                            <Button secondary on:click={() => (search = '')}>Clear search</Button>
                        </div>
                    </div>
                </EmptySearch>
            {:else}
                <EmptySearch hidePages>
                    <div class="common-section">
                        <div class="u-text-center common-section">
                            <p class="text u-line-height-1-5">You have no repositories.</p>
                            <p class="text u-line-height-1-5">
                                Need a hand? Learn more in our <a
                                    href="https://appwrite.io/docs/products/functions/deployment"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    documentation</a
                                >.
                            </p>
                        </div>
                    </div>
                </EmptySearch>
            {/if}
        {/await}
    {:else}
        {#await getBranches()}
            Fetching branches..
        {:then}
            <BoxAvatar>
                <svelte:fragment slot="image">
                    <div class="avatar">
                        <span class={getProviderIcon(selectedInstallation.provider)} />
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{selectedRepo.name}</h6>
                </svelte:fragment>
                <p>Last updated: {toLocaleDateTime(selectedRepo.pushedAt)}</p>
            </BoxAvatar>

            <InputSelectSearch
                required={true}
                id="branch"
                label="Branch"
                placeholder="main"
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
                tooltip="Don't create comments and checks when pushing to this repository"
                bind:value={silentMode} />
        {/await}
    {/if}

    <svelte:fragment slot="footer">
        {#if step === 1}
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
            <Button secondary disabled={!selectedRepoId} on:click={() => step++}>Next</Button>
        {:else}
            <Button secondary on:click={() => step--}>Back</Button>
            <Button submit>Deploy now</Button>
        {/if}
    </svelte:fragment>
</Modal>
