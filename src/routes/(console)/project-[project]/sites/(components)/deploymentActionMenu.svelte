<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconDownload,
        IconLightningBolt,
        IconRefresh,
        IconTrash,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';

    export let selectedDeployment: Models.Deployment;
    export let deployment: Models.Deployment;
    export let showDelete = false;
    export let showActivate = false;
    export let showRedeploy = false;
    export let showCancel = false;
    export let activeDeployment: string;
    export let inCard = false;

    function getDownload(deploymentId: string) {
        return (
            sdk.forProject.sites.getDeploymentDownload($page.params.site, deploymentId).toString() +
            '&mode=admin'
        );
    }
</script>

<Popover padding="none" placement="bottom-end" let:toggle>
    <Button
        text={!inCard}
        secondary={inCard}
        icon
        size="s"
        on:click={(e) => {
            e.preventDefault();
            toggle(e);
        }}>
        <Icon size="s" icon={IconDotsHorizontal} />
    </Button>
    <svelte:fragment slot="tooltip" let:toggle>
        <ActionMenu.Root>
            {#if !inCard}
                <ActionMenu.Item.Button
                    leadingIcon={IconRefresh}
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showRedeploy = true;
                        toggle(e);
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
                        toggle(e);
                    }}>
                    Activate
                </ActionMenu.Item.Button>
            {/if}
            {#if deployment?.status === 'ready' || deployment?.status === 'failed'}
                <ActionMenu.Item.Anchor
                    href={getDownload(deployment.$id)}
                    external
                    leadingIcon={IconDownload}
                    on:click={(e) => {
                        toggle(e);
                    }}>
                    Download
                </ActionMenu.Item.Anchor>
            {/if}

            {#if deployment?.status === 'processing' || deployment?.status === 'building' || deployment.status === 'waiting'}
                <ActionMenu.Item.Button
                    leadingIcon={IconXCircle}
                    status="danger"
                    on:click={(e) => {
                        e.preventDefault();
                        selectedDeployment = deployment;
                        showCancel = true;
                        toggle(e);
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
                        toggle(e);
                    }}>
                    Delete
                </ActionMenu.Item.Button>
            {/if}
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>
