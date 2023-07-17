<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { WizardStep } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { installation, installations, repository } from '../store';

    let selectedInstallation = null;
    async function loadInstallations() {
        const { installations } = await sdk.forProject.vcs.listInstallations();
        if (installations.length) {
            selectedInstallation = installations[0].$id;
            installation.set(installations.find((entry) => entry.$id === selectedInstallation));
        }
        return installations;
    }

    let search = '';
    let selectedRepository = null;
    async function loadRepositories(installationId: string, search: string) {
        return sdk.forProject.vcs.listRepositories(installationId, search || undefined);
    }

    const detectionMemory = new Map<string, Models.Detection>();
    async function loadDetection(installationId: string, repositoryId: string) {
        const key = `${installationId}.${repositoryId}`;
        if (detectionMemory.has(key)) {
            return detectionMemory.get(key);
        }
        const detection = await sdk.forProject.vcs.createRepositoryDetection(
            installationId,
            repositoryId
        );
        detectionMemory.set(key, detection);

        return detection;
    }

    $: hasInstallations = $installations?.total > 0;
    $: console.log(hasInstallations);
    async function beforeSubmit() {
        if (!hasInstallations) {
            throw new Error('Please connect a Git provider');
        }
        if (!selectedRepository) {
            throw new Error('Please select a repository');
        }
    }

    function connectGitHub() {
        const target = new URL($page.url);
        target.searchParams.append('github-installed', 'true');
        sdk.forProject.vcs.createGitHubInstallation(target.toString());
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Select repository</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Select a Git repository that will trigger your function deployments when updated.
    </svelte:fragment>
    {#if hasInstallations}
        {#await loadInstallations()}
            <div class="u-flex u-gap-8 u-cross-center u-main-center">
                <div class="loader u-margin-32" />
            </div>
        {:then installations}
            <div class="u-flex u-gap-16">
                <div class="u-width-full-line">
                    <InputSelect
                        id="installation"
                        label="Select installation"
                        showLabel={false}
                        options={installations.map((entry) => {
                            return {
                                label: entry.organization,
                                value: entry.$id
                            };
                        })}
                        on:change={() => {
                            search = '';
                            installation.set(
                                installations.find((entry) => entry.$id === selectedInstallation)
                            );
                        }}
                        bind:value={selectedInstallation} />
                </div>
                <div class="u-width-full-line">
                    <InputSearch placeholder="Search repositories" bind:value={search} />
                </div>
            </div>
        {/await}

        {#if selectedInstallation}
            <p class="text common-section">
                Manage organization configuration in your <a
                    class="link"
                    href={`${base}/console/project-${$page.params.project}/settings`}
                    >project settings</a
                >.
            </p>
            {#await loadRepositories(selectedInstallation, search)}
                <div class="card-git card is-border-dashed is-no-shadow common-section">
                    <div class="u-flex u-gap-8 u-cross-center u-main-center">
                        <div class="loader u-margin-16" />
                        Loading repositories...
                    </div>
                </div>
            {:then response}
                {#if response?.total}
                    <ul class="table is-remove-outer-styles u-sep-block-start common-section">
                        {#each response.repositories as repo}
                            <li class="table-row">
                                <label class="table-col u-cursor-pointer">
                                    <div class="u-flex u-cross-center u-gap-8">
                                        <input
                                            class="is-small u-margin-inline-end-8"
                                            type="radio"
                                            name={repo.name}
                                            bind:group={selectedRepository}
                                            on:change={() => repository.set(repo)}
                                            value={repo.id} />
                                        {#await loadDetection(selectedInstallation, repo.id)}
                                            <div class="avatar is-size-x-small">
                                                <div class="loader u-margin-16" />
                                            </div>
                                        {:then detection}
                                            <div
                                                class="avatar is-size-x-small"
                                                class:is-color-empty={!detection.runtime}>
                                                {#if detection.runtime}
                                                    <img
                                                        src={`${base}/icons/${$app.themeInUse}/color/${detection.runtime}.svg`}
                                                        alt={repo.name} />
                                                {/if}
                                            </div>
                                        {/await}
                                        <div class="u-flex u-gap-8">
                                            <span class="text">{repo.name}</span>

                                            <time
                                                class="u-color-text-gray"
                                                datetime={repo.pushedAt}>
                                                {toLocaleDateTime(repo.pushedAt)}
                                            </time>
                                        </div>
                                    </div>
                                </label>
                            </li>
                        {/each}
                    </ul>
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
                                <Button secondary on:click={() => (search = '')}
                                    >Clear search</Button>
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
        {/if}
    {:else}
        <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
            <Button on:click={() => connectGitHub()} fullWidth secondary>
                <span class="icon-github" aria-hidden="true" />
                <span class="text">Continue with GitHub</span>
            </Button>
            <Button disabled fullWidth secondary>
                <span class="icon-gitlab" aria-hidden="true" />
                <span class="text">GitLab (coming soon)</span>
            </Button>
            <Button disabled fullWidth secondary>
                <span class="icon-bitBucket" aria-hidden="true" />
                <span class="text">BitBucket (comong soon)</span>
            </Button>
        </div>
    {/if}
</WizardStep>
