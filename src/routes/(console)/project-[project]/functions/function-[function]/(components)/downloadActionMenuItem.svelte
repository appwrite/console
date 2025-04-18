<script lang="ts">
    import { page } from '$app/state';
    import { SubMenu } from '$lib/components/menu';
    import { type Models } from '@appwrite.io/console';
    import { IconDownload } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu } from '@appwrite.io/pink-svelte';
    import { getOutputDownload, getSourceDownload } from '../store';

    export let deployment: Models.Deployment;
    export let toggle: () => void;
</script>

{#if deployment?.status === 'ready' || deployment?.status === 'failed' || deployment?.status === 'building'}
    <SubMenu>
        <ActionMenu.Root noPadding>
            <ActionMenu.Item.Button trailingIcon={IconDownload}>Download</ActionMenu.Item.Button>
        </ActionMenu.Root>
        <svelte:fragment slot="menu">
            <ActionMenu.Root noPadding>
                <ActionMenu.Item.Anchor
                    on:click={toggle}
                    href={getSourceDownload(page.params.function, deployment.$id)}
                    external>
                    Download source
                </ActionMenu.Item.Anchor>

                <ActionMenu.Item.Anchor
                    disabled={deployment?.status !== 'ready'}
                    on:click={toggle}
                    href={getOutputDownload(page.params.function, deployment.$id)}
                    external>
                    Download output
                </ActionMenu.Item.Anchor>
            </ActionMenu.Root>
        </svelte:fragment>
    </SubMenu>
{/if}
