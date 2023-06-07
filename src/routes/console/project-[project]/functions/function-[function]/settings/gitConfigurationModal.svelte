<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch, PaginationInline } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';
    import { InputSearch, InputSelect } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';

    export let show: boolean;
    export let installations: Models.InstallationList;

    let step = 1;
    let installation: string;
    let search: string;
    let repositories: Models.RepositoryList;
    let offset = 0;

    let options = installations.installations.map((installation) => {
        return {
            value: installation.$id,
            label: installation.provider
        };
    });

    async function request() {
        if (!show) return;
        repositories = await sdk.forProject.vcs.listRepositories(installation, search);
    }

    $: if (search !== null) {
        offset = 0;
        request();
    }
</script>

<Modal headerDivider={false} bind:show size="big">
    <svelte:fragment slot="header">Git configuration</svelte:fragment>
    <p class="text">
        Configure a Git repository that will trigger your function deployments when updated.
    </p>

    <InputSelect
        {options}
        id="installations"
        label="installation"
        showLabel={false}
        bind:value={installation} />
    <InputSearch placeholder="Search repositories" bind:value={search} />

    <p class="text">
        Manage organization configuration in your <a
            class="link"
            href={`${base}/console/project-${$page.params.project}/settings`}>project settings</a
        >.
    </p>
    {#if repositories?.total}
        {#each repositories.repositories as repo}
            <div class="u-flex u-gap-16 u-cross-center">
                <!-- <div class="avatar is-medium">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${
                                        repo.runtime.split('-')[0]
                                    }.svg`}
                                    alt="technology" />
                            </div> -->
                <span class="text">{repo.name}</span>
            </div>
        {/each}
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {repositories?.total}</p>
            <PaginationInline limit={5} bind:offset sum={repositories?.total} hidePages />
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

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button secondary on:click={() => step++}>Next</Button>
    </svelte:fragment>
</Modal>
