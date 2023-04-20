<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let installations: Models.InstallationList;
    export let show = false;

    const functionId = $page.params.function;

    let selectedInstallation: Models.Installation = null;
    let repositories: Models.RepositoryList = null;

    let error: string;

    async function selectInstallation(installation: Models.Installation) {
        try {
            selectedInstallation = installation;

            repositories = await sdk.forProject.vcs.listRepositories(selectedInstallation.$id);
        } catch (e) {
            error = e.message;
        }
    }

    async function connectRepository(repository: Models.Repository) {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $page.data.function.name,
                $page.data.function.execute,
                $page.data.function.events || undefined,
                $page.data.function.schedule || undefined,
                $page.data.function.timeout || undefined,
                $page.data.function.enabled,
                selectedInstallation.$id,
                `${repository.id}`
            );

            show = false;

            await invalidate(Dependencies.FUNCTIONS);

            goto(
                `${base}/console/project-${$page.params.project}/functions/function-${functionId}`
            );
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal size="big" bind:show onSubmit={() => {}} bind:error>
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
    {:else}
        <p>
            2. Select repository:

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
                                        <Button on:click={() => connectRepository(repository)}
                                            >Connect</Button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <Empty single on:click={() => {}}>
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
    {/if}

    <svelte:fragment slot="footer" />
</Modal>
