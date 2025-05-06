<script lang="ts">
    import { cachedJwts } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { cleanFormattedDate } from './manageFileToken.svelte';
    import { Alert, Code, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let file: Models.File;
    export let token: Models.ResourceToken;

    let error = null;

    let codeSnippets = {};
    let selectedTab = 'Preview';

    async function getJwtForToken(): Promise<string> {
        // Return cached, if it's valid based on the token's expiration.
        if ($cachedJwts.has(token.$id)) {
            const cachedJwt = $cachedJwts.get(token.$id);
            const isExpired = !!token.expire && new Date(token.expire) < new Date();

            if (!isExpired) return cachedJwt;
        }

        const { jwt } = await sdk.forProject.tokens.getJWT(token.$id);

        // update the cached object!
        cachedJwts.update((map) => {
            map.set(token.$id, jwt);
            return map;
        });

        return jwt;
    }

    function copyPreviewWithToken(
        token: string,
        method: 'preview' | 'view' | 'download' = 'preview'
    ) {
        error = false;

        try {
            let url: string;
            if (method === 'view') {
                url = sdk.forProject.storage.getFileView(file.bucketId, file.$id);
            } else if (method === 'download') {
                url = sdk.forProject.storage.getFileDownload(file.bucketId, file.$id);
            } else {
                url = sdk.forProject.storage.getFilePreview(file.bucketId, file.$id);
            }

            url = `${url}&token=${token}`;

            return url;
        } catch (ignore) {
            error = true;
        }
    }

    async function setCodeSnippets() {
        const jwt = await getJwtForToken();
        return {
            Preview: `${copyPreviewWithToken(jwt)}`,
            View: `${copyPreviewWithToken(jwt, 'view')}`,
            Download: `${copyPreviewWithToken(jwt, 'download')}`
        };
    }

    function getMoreInfo(): string {
        let message = '';
        switch (selectedTab.toLowerCase()) {
            case 'preview':
                message =
                    'Use this URL to transform the file with added filtering. Ideal for thumbnails or previews.';
                break;
            case 'view':
                message =
                    'This link allows viewing the file directly in the browser, if supported. Great for documents or images.';
                break;
            case 'download':
                message =
                    'This URL triggers a direct download of the file. Perfect when you want users to save it locally.';
                break;
            default:
                message = '';
        }

        if (message) {
            if (token.expire && token.expire !== '') {
                message += `<br/><br/><b>URL expires on ${cleanFormattedDate(token.expire)}.</b>`;
            } else {
                message += `<br/><br/><b>Note: Token in the URL never expires.</b>`;
            }
        }

        return message;
    }

    $: if (show) {
        setCodeSnippets().then((snippets) => (codeSnippets = snippets));
    }
</script>

<Modal title="Copy File URL" bind:show hideFooter>
    <span slot="description"> Use the token-based URL below to access this file securely. </span>

    {#if error}
        <Alert.Inline title="Error" status="error">
            Something went wrong, could not generate the URL.
        </Alert.Inline>
    {:else}
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

            <Alert.Inline title="Quick tip" status="info">
                <Typography.Text variant="m-400">
                    {@html getMoreInfo()}
                </Typography.Text>
            </Alert.Inline>

            {#if !error}
                <Code lang="http" code={codeSnippets[selectedTab]} />
            {/if}
        </Layout.Stack>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
