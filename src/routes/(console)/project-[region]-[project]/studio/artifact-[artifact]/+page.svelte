<script lang="ts">
    import InputText from '../../../../../lib/elements/forms/inputText.svelte';
    import {
        IconChevronLeft,
        IconChevronRight,
        IconDeviceMobile,
        IconExternalLink,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Icon, Divider, Button } from '@appwrite.io/pink-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[region]-[project]/store';
    import type { EventHandler } from 'svelte/elements';
    import { onMount } from 'svelte';
    import { workspaceState } from '$lib/stores/chat';

    let iframeRef: HTMLIFrameElement | null = $state(null);
    let iframeContainerRef: HTMLDivElement | null = $state(null);
    $effect(() => {
        previewFrameRef.set(iframeRef);
    });

    onMount(() => {
        calculateIframeHeight();
    });

    const calculateIframeHeight = () => {
        if (iframeContainerRef && iframeRef) {
            const height = iframeContainerRef.offsetHeight;
            iframeRef.style.height = `${height + 5}px`;
        }
    };

    const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const path = formData.get('path');
        if (typeof path === 'string' && $workspaceState.workspaceUrl) {
            $workspaceState.workspaceUrl.pathname = path;
        }
    };

    let refresh = $state(false);
    let showMobileDevice = $state(false);
</script>

<svelte:window on:resize={calculateIframeHeight} />
<Layout.Stack direction="column" gap="s">
    <form {onsubmit}>
        <Layout.Stack direction="row" alignItems="center">
            <Button.Button
                variant="extra-compact"
                type="button"
                size="s"
                disabled={!$workspaceState.ready}
                onclick={() => alert('back button clicked')}>
                <Icon icon={IconChevronLeft} color="--fgcolor-neutral-tertiary" />
            </Button.Button>
            <Button.Button
                variant="extra-compact"
                type="button"
                size="s"
                disabled={!$workspaceState.ready}
                onclick={() => alert('forward button clicked')}>
                <Icon icon={IconChevronRight} color="--fgcolor-neutral-tertiary" />
            </Button.Button>
            <Button.Button
                variant="extra-compact"
                type="button"
                size="s"
                disabled={!$workspaceState.ready}
                on:click={() => (refresh = !refresh)}>
                <Icon icon={IconRefresh} color="--fgcolor-neutral-tertiary" />
            </Button.Button>
            <InputText
                disabled={!$workspaceState.ready}
                name="path"
                id="previewUrl"
                value={$workspaceState.workspaceUrl?.pathname ?? ''} />
            <Button.Button
                variant="extra-compact"
                type="button"
                disabled={!$workspaceState.ready}
                onclick={() => {
                    showMobileDevice = !showMobileDevice;
                }}
                size="s"
                ><Icon icon={IconDeviceMobile} color="--fgcolor-neutral-tertiary" /></Button.Button>
            <Button.Anchor
                variant="extra-compact"
                type="button"
                disabled={!$workspaceState.ready}
                href={$workspaceState.workspaceUrl?.toString() ?? ''}
                size="s"
                target="_blank"
                ><Icon icon={IconExternalLink} color="--fgcolor-neutral-tertiary" />
            </Button.Anchor>
        </Layout.Stack>
    </form>
    <div class="divider-wrapper">
        <Divider />
    </div>
</Layout.Stack>
<div
    class="iframe-container"
    class:mobile-container={showMobileDevice}
    bind:this={iframeContainerRef}>
    {#if $workspaceState.ready && $workspaceState.workspaceUrl}
        {#key refresh}
            <iframe
                src={$workspaceState.workspaceUrl}
                bind:this={iframeRef}
                id="preview-iframe"
                title="preview">
            </iframe>
        {/key}
    {/if}
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

        iframe {
            width: inherit;
            margin-inline-start: 0;
        }
    }
    iframe {
        border: none;
        position: absolute;

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
