<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import {
        IconDeviceMobile,
        IconExternalLink,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Icon, Divider } from '@appwrite.io/pink-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';

    const previewUrl = 'https://torsten.work';

    let iframeRef: HTMLIFrameElement | null = null;
    $: previewFrameRef.set(iframeRef);
</script>

<Layout.Stack direction="column" gap="s">
    <Layout.Stack direction="row" alignItems="center">
        <Icon icon={IconRefresh} color="--fgcolor-neutral-tertiary" />
        <InputText id="previewUrl" value={previewUrl} />
        <Icon icon={IconDeviceMobile} color="--fgcolor-neutral-tertiary" />
        <Icon icon={IconExternalLink} color="--fgcolor-neutral-tertiary" />
    </Layout.Stack>
    <div class="divider-wrapper">
        <Divider />
    </div>
</Layout.Stack>
<div class="iframe-container">
    <iframe src={previewUrl} bind:this={iframeRef} id="preview-iframe" title="preview"></iframe>
</div>

<style lang="scss">
    .iframe-container {
        height: 100%;

        @media (min-width: 768px) {
            flex-grow: 1;
            height: auto;
        }
    }
    iframe {
        border: none;
        width: calc(100% + 2 * var(--space-7));
        height: 100%;
        margin-inline-start: calc(-1 * var(--space-7));
    }

    .divider-wrapper {
        margin-inline-start: calc(-1 * var(--space-7));
        width: calc(100% + var(--space-10));
    }
</style>
