<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Modal from '$lib/components/modal.svelte';
    import { Dependencies } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import { TableBody, TableCell, TableRow } from '$lib/elements/table';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import Table from '$lib/elements/table/table.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

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
</script>

<Modal
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:show={showGitDisconnect}
    onSubmit={handleSubmit}
    size="small">
    <svelte:fragment slot="header">Disconnect installation</svelte:fragment>

    {#if selectedInstallation.functions.length > 0}
        <p>
            Are you sure you want to disconnect this git installation? This will affect future
            deployments to the following functions:
        </p>

        <div style="max-height: 170px;">
            <div class="u-flex u-flex-vertical u-gap-12">
                {#each selectedInstallation.functions as func}
                    <div class="u-flex u-main-space-between u-cross-center u-width-full-line">
                        <div class="u-flex u-main-start u-cross-center u-gap-8">
                            <div class="avatar">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${
                                        func.runtime.split('-')[0]
                                    }.svg`}
                                    alt="technology" />
                            </div>
                            <h6>{func.name}</h6>
                        </div>

                        <p class="u-x-small" style="color: hsl(var(--color-neutral-70));">
                            Last deployed: 12m ago
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <p>Are you sure you want to disconnect this git installation?</p>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showGitDisconnect = false)}>Cancel</Button>
        <Button secondary submit={true}>Disconnect</Button>
    </svelte:fragment>
</Modal>
