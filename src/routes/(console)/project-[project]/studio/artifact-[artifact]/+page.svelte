<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import {
        IconDeviceMobile,
        IconExternalLink,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Icon, Divider, Button } from '@appwrite.io/pink-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import { SvelteURL } from 'svelte/reactivity';
    import type { EventHandler } from 'svelte/elements';

    let previewUrl = new SvelteURL('https://preview.torsten.work');

    let iframeRef: HTMLIFrameElement | null = $state(null);
    $effect(() => {
        previewFrameRef.set(iframeRef);
    });

    const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const path = formData.get('path');
        if (typeof path === 'string') {
            previewUrl.pathname = path;
        }
    };

    let refresh = $state(false);
    let showMobileDevice = $state(false);
</script>

<Layout.Stack direction="column" gap="s">
    <form {onsubmit}>
        <Layout.Stack direction="row" alignItems="center">
            <Button.Button
                variant="extra-compact"
                type="button"
                size="s"
                on:click={() => (refresh = !refresh)}>
                <Icon icon={IconRefresh} color="--fgcolor-neutral-tertiary" />
            </Button.Button>
            <InputText name="path" id="previewUrl" value={previewUrl.pathname} />
            <Button.Button
                variant="extra-compact"
                type="button"
                onclick={() => {
                    showMobileDevice = !showMobileDevice;
                }}
                size="s"
                ><Icon icon={IconDeviceMobile} color="--fgcolor-neutral-tertiary" /></Button.Button>
            <Button.Anchor
                variant="extra-compact"
                type="button"
                href={previewUrl.toString()}
                size="s"
                external={true}
                ><Icon icon={IconExternalLink} color="--fgcolor-neutral-tertiary" />
            </Button.Anchor>
        </Layout.Stack>
    </form>
    <div class="divider-wrapper">
        <Divider />
    </div>
</Layout.Stack>
<div class="iframe-container" class:mobile-container={showMobileDevice}>
    {#key refresh}
        <iframe
            src={previewUrl.toString()}
            bind:this={iframeRef}
            id="preview-iframe"
            title="preview">
        </iframe>
    {/key}
</div>

<style lang="scss">
    .iframe-container {
        height: 100%;

        @media (min-width: 768px) {
            flex-grow: 1;
            height: auto;
        }
    }

    .mobile-container {
        width: 400px;
        margin: 0 auto;
    }
    iframe {
        border: none;
        height: 100%;

        margin-inline-start: calc(-1 * var(--space-4));
        width: calc(100% + var(--space-7));
        @media (min-width: 768px) {
            margin-inline-start: calc(-1 * var(--space-7));
            width: calc(100% + 2 * var(--space-7));
        }
    }

    .divider-wrapper {
        margin-inline-start: calc(-1 * var(--space-4));
        width: calc(100% + var(--space-7));
        @media (min-width: 768px) {
            margin-inline-start: calc(-1 * var(--space-7));
            width: calc(100% + var(--space-10));
        }
    }
</style>
