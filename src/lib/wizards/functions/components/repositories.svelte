<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch } from '$lib/components';
    import { Button, InputSearch, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { repositories } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
    import { installation, installations, repository } from '../store';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let callbackState: Record<string, string> = null;
    export let selectedRepository: string = null;
    export let hasInstallations = false;
    export let action: 'button' | 'select' = 'select';

    $: {
        hasInstallations = $installations?.total > 0;
    }

    let selectedInstallation = null;
    async function loadInstallations() {
        const { installations } = await sdk
            .forProject($page.params.region, $page.params.project)
            .vcs.listInstallations();
        if (installations.length) {
            selectedInstallation = installations[0].$id;
            installation.set(installations.find((entry) => entry.$id === selectedInstallation));
        }
        return installations;
    }

    let search = '';
    async function loadRepositories(installationId: string, search: string) {
        if (
            !$repositories ||
            $repositories.installationId !== installationId ||
            $repositories.search !== search
        ) {
            $repositories.repositories = (
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .vcs.listRepositories(installationId, search || undefined)
            ).providerRepositories;
        }

        $repositories.search = search;
        $repositories.installationId = installationId;

        if ($repositories.repositories.length) {
            selectedRepository = $repositories.repositories[0].id;
            $repository = $repositories.repositories[0];
        }

        return $repositories.repositories.slice(0, 4);
    }

    function connectGitHub() {
        const redirect = new URL($page.url);
        if (callbackState) {
            Object.keys(callbackState).forEach((key) => {
                redirect.searchParams.append(key, callbackState[key]);
            });
        }
        const target = new URL(
            `${sdk.forProject($page.params.region, $page.params.project).client.config.endpoint}/vcs/github/authorize`
        );
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target;
    }
</script>

{#if hasInstallations}
    {#await loadInstallations()}
        <div class="u-flex u-gap-16">
            <ul class="u-width-full-line">
                <InputSelect
                    disabled
                    id="installation"
                    label="Select installation"
                    showLabel={false}
                    options={[
                        {
                            label: 'Loading...',
                            value: null
                        }
                    ]}
                    value={null} />
            </ul>
            <ul class="u-width-full-line">
                <InputSearch placeholder="Search repositories" disabled />
            </ul>
        </div>
    {:then installations}
        <div class="u-flex u-gap-16">
            <ul class="u-width-full-line">
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
            </ul>
            <ul class="u-width-full-line">
                <InputSearch placeholder="Search repositories" bind:value={search} />
            </ul>
        </div>
    {/await}
    <p class="text u-margin-block-start-16">
        Manage organization configuration in your <a
            class="link"
            href={`${base}/project-${$page.params.region}-${$page.params.project}/settings`}
            >project settings</a
        >.
    </p>
    {#if selectedInstallation}
        {#await loadRepositories(selectedInstallation, search)}
            <div class="u-flex u-gap-8 u-cross-center u-main-center" style:height="50vh">
                <div class="loader u-margin-32" />
            </div>
        {:then response}
            {#if response?.length}
                <ul class="table is-remove-outer-styles common-section">
                    {#each response as repo, i}
                        <li
                            class="table-row"
                            style:border-block-end={i === response.length - 1 ? 'none' : null}>
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
                                    <div class="u-flex u-gap-8 u-cross-center">
                                        <span class="text u-trim-1">{repo.name}</span>
                                        {#if repo.private}
                                            <span
                                                class="icon-lock-closed"
                                                style="font-size: var(--icon-size-small)"
                                                aria-hidden="true" />
                                        {/if}
                                        <time
                                            class="u-color-text-gray u-trim-1"
                                            datetime={repo.pushedAt}>
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
                            <Button secondary on:click={() => (search = '')}>Clear search</Button>
                        </div>
                    </div>
                </EmptySearch>
            {:else}
                <EmptySearch hidePages />
            {/if}
        {/await}
    {/if}
{:else}
    <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
        <Button href={connectGitHub().toString()} fullWidth secondary>
            <span class="icon-github" aria-hidden="true" />
            <span class="text">GitHub</span>
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

<style>
    .icon-lock-closed {
        color: hsl(var(--color-neutral-50));
    }
</style>
