<script lang="ts">
    import { page } from '$app/stores';
    import { SubMenu } from '$lib/components/menu';
    import { sdk } from '$lib/stores/sdk';
    import { DeploymentDownloadType, type Models } from '@appwrite.io/console';
    import { IconDownload } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu } from '@appwrite.io/pink-svelte';

    export let deployment: Models.Deployment;
    export let toggle: () => void;
    function getOutputDownload(deploymentId: string) {
        return (
            sdk.forProject.functions.getDeploymentDownload(
                $page.params.function,
                deploymentId.toString(),
                DeploymentDownloadType.Output
            ) + '&mode=admin'
        );
    }
    function getSourceDownload(deploymentId: string) {
        return (
            sdk.forProject.functions.getDeploymentDownload(
                $page.params.function,
                deploymentId.toString(),
                DeploymentDownloadType.Source
            ) + '&mode=admin'
        );
    }
</script>

{#if deployment?.status === 'ready' || deployment?.status === 'failed'}
    <SubMenu>
        <ActionMenu.Root noPadding>
            <ActionMenu.Item.Button trailingIcon={IconDownload}>Download</ActionMenu.Item.Button>
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
