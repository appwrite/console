<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Box, EmptySearch, Modal, PaginationInline } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { InputChoice, InputSearch, InputSelect, InputText, Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { func } from '../store';
    import { invalidate } from '$app/navigation';

    export let show: boolean;
    export let installations: Models.InstallationList;

    const functionId = $page.params.function;

    let selectedRepo: string;
    let step = 1;
    let installation: string;
    let search: string;
    let repositoriesList: Models.RepositoryList;
    let branchesList: Models.BranchList;
    let offset = 0;
    let selectedBranch: string;
    let selectedDir: string;
    let silentMode = false;

    let installationsOptions = installations.installations.map((installation) => {
        return {
            value: installation.$id,
            label: installation.provider
        };
    });

    async function handleSubmit() {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled,
                $func.logging,
                $func.entrypoint,
                $func.buildCommand,
                $func.installCommand,
                installation,
                selectedRepo,
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
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateConfiguration);
        }
    }

    async function getRepos() {
        if (!show || !installation) return;
        repositoriesList = await sdk.forProject.vcs.listRepositories(installation, search);
    }
    async function getBranches() {
        if (!show || !installation) return;
        branchesList = await sdk.forProject.vcs.listRepositoryBranches(installation, selectedRepo);
        selectedBranch = branchesList?.branches[0].name;
    }

    $: if (search !== null) {
        offset = 0;
        getRepos();
    }
</script>

<Modal headerDivider={false} bind:show size="big" onSubmit={handleSubmit}>
    <svelte:fragment slot="header">Git configuration</svelte:fragment>
    <p class="text">
        Configure a Git repository that will trigger your function deployments when updated.
    </p>
    {#if step === 1}
        {#await getRepos()}
            loading...
        {:then}
            <InputSelect
                options={installationsOptions}
                id="installations"
                label="installation"
                showLabel={false}
                bind:value={installation} />
            <InputSearch placeholder="Search repositories" bind:value={search} />

            <p class="text">
                Manage organization configuration in your <a
                    class="link"
                    href={`${base}/console/project-${$page.params.project}/settings`}
                    >project settings</a
                >.
            </p>
            {#if repositoriesList?.total}
                {#each repositoriesList.repositories as repo}
                    <ul class="u-flex u-gap-16 u-cross-center">
                        <li>
                            <label class="input-radio">
                                <input
                                    type="radio"
                                    name={repo.name}
                                    bind:group={selectedRepo}
                                    value={repo.id} />
                            </label>
                        </li>

                        <span class="text">{repo.name}</span>
                    </ul>
                {/each}
                <div class="u-flex u-margin-block-start-32 u-main-space-between">
                    <p class="text">Total results: {repositoriesList?.total}</p>
                    <PaginationInline
                        limit={5}
                        bind:offset
                        sum={repositoriesList?.total}
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
                            <Button external href="https://appwrite.io/docs/client/teams" text
                                >Documentation</Button>
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
                                    href="https://appwrite.io/docs/client/teams"
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
            loading...
        {:then}
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{selectedRepo}</h6>
                </svelte:fragment>
                <p>Last updated: {toLocaleDateTime(selectedRepo)}</p>
            </Box>

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
            <InputText id="root" label="Root directory" bind:value={selectedDir} />
            <InputChoice
                id="silent"
                label="Silent mode"
                tooltip="I don't know 🤷"
                bind:value={silentMode} />
        {/await}
    {/if}

    <svelte:fragment slot="footer">
        {#if step === 1}
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
            <Button secondary disabled={!selectedRepo} on:click={() => step++}>Next</Button>
        {:else}
            <Button secondary on:click={() => step--}>Back</Button>
            <Button submit>Deploy now</Button>
        {/if}
    </svelte:fragment>
</Modal>
