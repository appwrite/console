<script lang="ts">
    import { page } from '$app/stores';
    import { Menu } from '$lib/components/menu';
    import SubMenu from '$lib/components/menu/subMenu.svelte';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { DeploymentDownloadType, type Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconDownload,
        IconLightningBolt,
        IconRefresh,
        IconTrash,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Icon } from '@appwrite.io/pink-svelte';

    export let selectedDeployment: Models.Deployment;
    export let deployment: Models.Deployment;
    export let showDelete = false;
    export let showActivate = false;
    export let showRedeploy = false;
    export let showCancel = false;
    export let activeDeployment: string;
    export let inCard = false;

    function getOutputDownload(deploymentId: string) {
        return (
            sdk.forProject.sites.getDeploymentDownload(
                $page.params.site,
                deploymentId.toString(),
                DeploymentDownloadType.Output
            ) + '&mode=admin'
        );
    }
    function getSourceDownload(deploymentId: string) {
        return (
            sdk.forProject.sites.getDeploymentDownload(
                $page.params.site,
                deploymentId.toString(),
                DeploymentDownloadType.Source
            ) + '&mode=admin'
        );
    }
</script>

<Menu>
    <Button text={!inCard} secondary={inCard} icon size="s">
        <Icon size="s" icon={IconDotsHorizontal} />
    </Button>
    <svelte:fragment slot="menu" let:toggle>
        <ActionMenu.Root>
            {#if !inCard}
                <ActionMenu.Item.Button
                    leadingIcon={IconRefresh}
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showRedeploy = true;
                        toggle();
                    }}>
                    Redeploy
                </ActionMenu.Item.Button>
            {/if}
            {#if deployment?.status === 'ready' && deployment?.$id !== activeDeployment}
                <ActionMenu.Item.Button
                    leadingIcon={IconLightningBolt}
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showActivate = true;
                        toggle();
                    }}>
                    Activate
                </ActionMenu.Item.Button>
            {/if}
            {#if deployment?.status === 'ready' || deployment?.status === 'failed'}
                <SubMenu>
                    <ActionMenu.Root noPadding>
                        <ActionMenu.Item.Button leadingIcon={IconDownload}>
                            Download
                        </ActionMenu.Item.Button>
                    </ActionMenu.Root>
                    <svelte:fragment slot="menu">
                        <ActionMenu.Root noPadding>
                            <ActionMenu.Item.Anchor
                                on:click={toggle}
                                href={getSourceDownload(deployment.$id)}
                                external>
                                Download source
                            </ActionMenu.Item.Anchor>

                            <ActionMenu.Item.Anchor
                                disabled={deployment?.status !== 'ready'}
                                on:click={toggle}
                                href={getOutputDownload(deployment.$id)}
                                external>
                                Download output
                            </ActionMenu.Item.Anchor>
                        </ActionMenu.Root>
                    </svelte:fragment>
                </SubMenu>
            {/if}

            {#if deployment?.status === 'processing' || deployment?.status === 'building' || deployment.status === 'waiting'}
                <ActionMenu.Item.Button
                    leadingIcon={IconXCircle}
                    status="danger"
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showCancel = true;
                    }}>
                    Cancel
                </ActionMenu.Item.Button>
            {/if}
            {#if deployment.status !== 'building' && deployment.status !== 'processing' && deployment?.status !== 'waiting'}
                <ActionMenu.Item.Button
                    status="danger"
                    leadingIcon={IconTrash}
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showDelete = true;
                    }}>
                    Delete
                </ActionMenu.Item.Button>
            {/if}
        </ActionMenu.Root>
    </svelte:fragment>
</Menu>
