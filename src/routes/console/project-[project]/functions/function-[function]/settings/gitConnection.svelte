<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    export let installations: Models.InstallationList;
    export let show = false;
    const functionId = $page.params.function;
    let selectedInstallation: Models.Installation = null;
    let selectedRepository: Models.Repository = null;
    let selectedBranchName: string = null;
    let rootDirectory: string = null;
    let silentMode = false;
    let repositories: Models.RepositoryList = null;
    let branches: Models.BranchList = null;
    let error: string;
    async function selectInstallation(installation: Models.Installation) {
        try {
            selectedInstallation = installation;
        } catch (e) {
            error = e.message;
        }
    }
    async function searchRepositories(searchQuery: string) {
        repositories = await sdkForProject.vcs.listRepositories(
            selectedInstallation.$id,
            searchQuery || undefined
        );
    }

    $: if (selectedInstallation) {
        searchRepositories(inputValue);
    }

    async function selectRepository(repository: Models.Repository) {
        selectedRepository = repository;

        branches = await sdkForProject.vcs.listRepositoryBranches(
            selectedInstallation.$id,
            repository.id
        );
    }

    async function connectRepository() {
        try {
            await sdkForProject.functions.update(
                functionId,
                $page.data.function.name,
                $page.data.function.execute,
                $page.data.function.events,
                $page.data.function.schedule,
                $page.data.function.timeout,
                $page.data.function.enabled,
                $page.data.function.logging,
                $page.data.function.entrypoint,
                $page.data.function.buildCommand,
                $page.data.function.installCommand,
                selectedInstallation.$id,
                selectedRepository.id,
                selectedBranchName,
                silentMode,
                rootDirectory
            );
            show = false;
            await invalidate(Dependencies.FUNCTION);
            goto(
                `${base}/console/project-${$page.params.project}/functions/function-${functionId}`
            );
        } catch (e) {
            error = e.message;
        }
    }

    let inputValue = '';
</script>

<Modal size="big" bind:show bind:error>
    <svelte:fragment slot="header">Connect Git</svelte:fragment>

    {#if selectedInstallation === null}
        <p>1. Select installation:</p>
        {#if installations.installations.length > 0}
            <div class="table-wrapper">
                <table class="table is-table-layout-auto is-remove-outer-styles">
                    <tbody class="table-tbody">
                        {#each installations.installations as installation (installation.$id)}
                            <tr class="table-row">
                                <td class="table-col" data-title="Installation">
                                    <label
                                        class="u-flex u-cross-center u-gap-8"
                                        for={installation.$id}>
                                        <div class="avatar is-size-small">
                                            <span class="icon-github" aria-hidden="true" />
                                        </div>
                                        <div class="u-line-height-1-5">
                                            <div class="body-text-2 u-bold">
                                                {installation.organization}
                                            </div>
                                        </div>
                                    </label>
                                </td>

                                <td class="table-col" data-title="Enabled" style="--p-col-width:40">
                                    <Button on:click={() => selectInstallation(installation)}
                                        >Select</Button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <Empty
                single
                on:click={() =>
                    goto(
                        `${base}/console/project-${$page.params.project}/settings/git-installations`
                    )}>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No installation found. Create one to continue.</p>
                    </div>
                </div>
            </Empty>
        {/if}
    {:else if !selectedRepository}
        <p>
            2. Select repository:

            <input type="text" bind:value={inputValue} placeholder="Enter a string" />
            {#if repositories === null}
                <p>Loading...</p>
            {:else if repositories.repositories.length > 0}
                <div class="table-wrapper">
                    <table class="table is-table-layout-auto is-remove-outer-styles">
                        <tbody class="table-tbody">
                            {#each repositories.repositories as repository (repository.id)}
                                <tr class="table-row">
                                    <td class="table-col" data-title="Installation">
                                        <label
                                            class="u-flex u-cross-center u-gap-8"
                                            for={`${repository.id}`}>
                                            <div class="avatar is-size-small">
                                                <span class="icon-github" aria-hidden="true" />
                                            </div>
                                            <div class="u-line-height-1-5">
                                                <div class="body-text-2 u-bold">
                                                    {repository.name}
                                                </div>
                                            </div>
                                        </label>
                                    </td>

                                    <td
                                        class="table-col"
                                        data-title="Enabled"
                                        style="--p-col-width:40">
                                        <Button on:click={() => selectRepository(repository)}
                                            >Select</Button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <Empty single>
                    <div class="u-flex u-flex-vertical u-cross-center">
                        <div class="common-section">
                            <p>
                                No repository found. You might be missing permissions on your Git
                                provider.
                            </p>
                        </div>
                    </div>
                </Empty>
            {/if}
        </p>
    {:else}
        <p>
            3. Select branch:

            {#if branches === null}
                <p>Loading...</p>
            {:else}
                <InputSelect
                    options={branches.branches.map((branch) => {
                        return {
                            label: branch.name,
                            value: branch.name
                        };
                    })}
                    bind:value={selectedBranchName}
                    id="branch"
                    label="Branch" />

                <p>4. Enter root directory</p>
                <InputText
                    id="rootDirectory"
                    bind:value={rootDirectory}
                    label="Root directory"
                    placeholder="." />

                <p>5. Silent mode?</p>
                <InputCheckbox id="silentMode" bind:value={silentMode} label="Silent mode?" />

                <Button on:click={() => connectRepository()}>Deploy Now</Button>
            {/if}
        </p>
    {/if}

    <svelte:fragment slot="footer" />
</Modal>
