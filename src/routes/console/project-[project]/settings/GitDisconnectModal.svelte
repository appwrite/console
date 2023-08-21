<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Modal from '$lib/components/modal.svelte';
    import { Dependencies } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { Avatar } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';

    export let showGitDisconnect: boolean;
    export let selectedInstallation: Models.Installation;

    async function handleSubmit() {
        try {
            await sdk.forProject.vcs.deleteInstallation(selectedInstallation.$id);
            await invalidate(Dependencies.PROJECT_INSTALLATIONS);
            addNotification({
                message: `${selectedInstallation.organization} has been disconnected from your project`,
                type: 'success'
            });
            trackEvent(Submit.InstallationDelete, {
                customId: selectedInstallation.$id
            });
            showGitDisconnect = false;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.InstallationDelete);
            showGitDisconnect = false;
        }
    }

    async function loadFunctions() {
        return await sdk.forProject.functions.list([
            Query.limit(100),
            Query.equal('installationId', selectedInstallation.$id)
        ]);
    }
</script>

<Modal
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:show={showGitDisconnect}
    onSubmit={handleSubmit}
    size="big">
    <svelte:fragment slot="header">Disconnect installation</svelte:fragment>
    <p>
        Are you sure you want to disconnect this git installation? This will affect future
        deployments to the following functions:
    </p>

    {#await loadFunctions()}
        <div class="u-flex u-main-center">
            <div class="avatar is-size-x-small">
                <div class="loader u-margin-16" />
            </div>
        </div>
    {:then functions}
        {#if functions.total}
            <div class="u-flex u-flex-vertical u-gap-12">
                {#each functions.functions as func}
                    <div class="u-flex u-main-space-between u-cross-center u-width-full-line">
                        <div class="u-flex u-main-start u-cross-center u-gap-8">
                            <Avatar
                                size={24}
                                name={func.runtime.split('-')[0]}
                                src={`${base}/icons/${$app.themeInUse}/color/${
                                    func.runtime.split('-')[0]
                                }.svg`} />

                            <h6>{func.name}</h6>
                        </div>

                        <p class="u-x-small" style="color: hsl(var(--color-neutral-70));">
                            Last deployed: {toLocaleDateTime(func.$updatedAt)}
                        </p>
                    </div>
                {/each}
            </div>
        {:else}
            <p>Are you sure you want to disconnect this git installation?</p>
        {/if}
    {/await}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showGitDisconnect = false)}>Cancel</Button>
        <Button secondary submit={true}>Disconnect</Button>
    </svelte:fragment>
</Modal>
