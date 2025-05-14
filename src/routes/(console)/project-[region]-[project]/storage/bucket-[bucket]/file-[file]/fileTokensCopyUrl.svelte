<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Modal, Card, CopyInput } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Alert, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let file: Models.File;
    export let token: Models.ResourceToken;

    let tabContents = {};
    let selectedTab = 'Preview';

    function copyPreviewWithToken(
        token: string,
        method: 'preview' | 'view' | 'download' = 'preview'
    ) {
        let url: string;
        if (method === 'view') {
            url = sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFileView(file.bucketId, file.$id);
        } else if (method === 'download') {
            url = sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFileDownload(file.bucketId, file.$id);
        } else {
            url = sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview(file.bucketId, file.$id);
        }

        url = `${url}&token=${token}`;

        return url;
    }

    function setUrlSnippets() {
        tabContents = {
            Preview: `${copyPreviewWithToken(token.secret)}`,
            View: `${copyPreviewWithToken(token.secret, 'view')}`,
            Download: `${copyPreviewWithToken(token.secret, 'download')}`
        };
    }

    function getMoreInfo(): string {
        let message = '';
        switch (selectedTab.toLowerCase()) {
            case 'preview':
                message = 'Apply transformations or filters. Good for thumbnails or previews.';
                break;
            case 'view':
                message =
                    'Open the file in the browser (if supported). Works well for images and documents.';
                break;
            case 'download':
                message = 'Download the file directly. Use when users need a local copy.';
                break;
            default:
                message = '';
        }

        return message;
    }

    $: if (show) {
        setUrlSnippets();
    }
</script>

<Modal title="Copy File URL" bind:show hideFooter>
    {@const tokenUrl = tabContents[selectedTab]}
    <span slot="description"> Use the token-based URL below to access this file securely. </span>

    <Layout.Stack gap="xl">
        <Tabs.Root let:root stretch>
            {#each ['Preview', 'View', 'Download'] as cat}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = cat)}
                    active={selectedTab === cat}>
                    {cat}
                </Tabs.Item.Button>
            {/each}
        </Tabs.Root>

        <Typography.Text variant="m-400">
            {getMoreInfo()}
        </Typography.Text>
        {#if !token.expire}
            <Alert.Inline title="No expiration date" status="warning">
                This token doesn't expire. Be cautious when sharing links.
            </Alert.Inline>
        {/if}
        <CopyInput value={tokenUrl} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
