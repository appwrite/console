<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, installations, repository } from '../store';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let selectedRepository: string = null;
    export let hasInstallations = false;
    export let action: 'button' | 'select' = 'select';

    $: {
        hasInstallations = $installations?.total > 0;
    }

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
    async function loadRepositories(installationId: string, search: string) {
        const repositories = await sdk.forProject.vcs.listRepositories(
            installationId,
            search || undefined
        );

        if (repositories.providerRepositories.length) {
            selectedRepository = repositories.providerRepositories[0].id;
            $repository = repositories.providerRepositories[0];
        }

        return repositories;
    }

    function connectGitHub() {
        const redirect = new URL($page.url);
        redirect.searchParams.append('github-installed', 'true');
        const target = new URL(`${sdk.forProject.client.config.endpoint}/vcs/github/authorize`);
        target.searchParams.set('projectId', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        return target;
    }
</script>

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
                <ul class="table is-remove-outer-styles common-section">
                    {#each response.providerRepositories as repo}
                        <li class="table-row">
                            <div class="table-col">
                                <div
                                    class="u-flex u-cross-center u-gap-8"
                                    style="margin-block: .75rem;">
                                    {#if action === 'select'}
                                        <input
                                            class="is-small u-margin-inline-end-8"
                                            type="radio"
                                            name="repositories"
                                            bind:group={selectedRepository}
                                            on:change={() => repository.set(repo)}
                                            value={repo.id} />
                                    {/if}
                                    <div
                                        class="avatar is-size-x-small"
                                        style:--p-text-size="1.25rem"
                                        class:is-color-empty={!repo.runtime}>
                                        {#if repo.runtime}
                                            <img
                                                src={`${base}/icons/${$app.themeInUse}/color/${
                                                    repo.runtime.split('-')[0]
                                                }.svg`}
                                                alt={repo.name} />
                                        {/if}
                                    </div>
                                    <div class="u-flex u-gap-8">
                                        <span class="text">{repo.name}</span>
                                        {#if repo.private}
                                            <span class="icon-lock" aria-hidden="true" />
                                        {/if}
                                        <time class="u-color-text-gray" datetime={repo.pushedAt}>
                                            {timeFromNow(repo.pushedAt)}
                                        </time>
                                    </div>
                                    {#if action === 'button'}
                                        <div class="u-margin-inline-start-auto">
                                            <Button
                                                secondary
                                                on:click={() => dispatch('connect', repo)}>
                                                Connect
                                            </Button>
                                        </div>
                                    {/if}
                                </div>
                            </div>
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
    {/if}
{:else}
    <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
        <Button href={connectGitHub().toString()} fullWidth secondary>
            <span class="icon-github" aria-hidden="true" />
            <span class="text">Continue with GitHub</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-gitlab" aria-hidden="true" />
            <span class="text">GitLab (coming soon)</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-bitBucket" aria-hidden="true" />
            <span class="text">BitBucket (coming soon)</span>
        </Button>
        <Button disabled fullWidth secondary>
            <span class="icon-azure" aria-hidden="true" />
            <span class="text">Azure (coming soon)</span>
        </Button>
    </div>
{/if}
