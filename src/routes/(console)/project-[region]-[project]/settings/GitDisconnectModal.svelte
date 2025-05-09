<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { Avatar, Confirm } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconGlobeAlt, IconLightningBolt } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';

    export let showGitDisconnect: boolean;
    export let selectedInstallation: Models.Installation;

    async function handleSubmit() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.deleteInstallation(selectedInstallation.$id);
            await invalidate(Dependencies.PROJECT_INSTALLATIONS);
            addNotification({
                message: `${selectedInstallation.organization} has been disconnected from this project`,
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
        return await sdk
            .forProject(page.params.region, page.params.project)
            .functions.list([
                Query.limit(100),
                Query.equal('installationId', selectedInstallation.$id)
            ]);
    }

    async function loadSites() {
        return await sdk
            .forProject(page.params.region, page.params.project)
            .sites.list([
                Query.limit(100),
                Query.equal('installationId', selectedInstallation.$id)
            ]);
    }
</script>

<Confirm title="Disconnect installation" bind:open={showGitDisconnect} onSubmit={handleSubmit}>
    {#await Promise.all([loadFunctions(), loadSites()])}
        <div class="u-flex u-main-center">
            <div class="avatar is-size-x-small">
                <div class="loader u-margin-16"></div>
            </div>
        </div>
    {:then [functions, sites]}
        {#if functions?.total || sites?.total}
            <p>
                Are you sure you want to disconnect this git installation? This will affect future
                deployments to the following sites and functions:
            </p>
            <Layout.Stack>
                {#each sites.sites as site}
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                            <Avatar size="xs" alt={site.name}>
                                <Icon icon={IconGlobeAlt} size="s" />
                            </Avatar>
                            <Typography.Text color="--fgcolor-neutral-primary">
                                {site.name}
                            </Typography.Text>
                        </Layout.Stack>
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Last deployed: {toLocaleDateTime(site.$updatedAt)}
                        </Typography.Caption>
                    </Layout.Stack>
                {/each}
                {#each functions.functions as func}
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                            {#if func?.runtime}
                                <Avatar size="xs" alt={func.name}>
                                    <Icon icon={IconLightningBolt} size="s" />
                                </Avatar>
                                <Typography.Text color="--fgcolor-neutral-primary">
                                    {func.name}
                                </Typography.Text>
                            {/if}
                        </Layout.Stack>
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Last deployed: {toLocaleDateTime(func.$updatedAt)}
                        </Typography.Caption>
                    </Layout.Stack>
                {/each}
            </Layout.Stack>
        {:else}
            <p>Are you sure you want to disconnect this git installation?</p>
        {/if}
    {/await}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showGitDisconnect = false)}>Cancel</Button>
        <Button secondary submit={true}>Disconnect</Button>
    </svelte:fragment>
</Confirm>
