<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { isTabletViewport } from '$lib/stores/viewport';

    export let title: string;
    export let type: 'info' | 'success' | 'warning' | 'error' | 'default' = 'info';

    let container: HTMLElement | null = null;

    function setNavigationHeight() {
        const alertHeight = container ? container.getBoundingClientRect().height : 0;
        const header: HTMLHeadingElement = document.querySelector('main > header');
        const sidebar: HTMLElement = document.querySelector('main > div > nav');
        const contentSection: HTMLElement = document.querySelector('main > div > section');

        if (header) {
            header.style.top = `${alertHeight}px`;
        }
        if (sidebar) {
            sidebar.style.top = `${alertHeight + ($isTabletViewport ? 0 : header.getBoundingClientRect().height)}px`;
            sidebar.style.height = `calc(100vh - (${alertHeight + ($isTabletViewport ? 0 : header.getBoundingClientRect().height)}px))`;
        }
        if (contentSection) {
            contentSection.style.paddingBlockStart = `${alertHeight}px`;
        }
    }

    onMount(() => {
        setNavigationHeight();
    });

    onDestroy(() => {
        container = null;
        setNavigationHeight();
    });
</script>

<svelte:window on:resize={setNavigationHeight} />

<section
    bind:this={container}
    class="alert is-action is-action-and-top-sticky u-sep-block-end"
    class:is-success={type === 'success'}
    class:is-warning={type === 'warning'}
    class:is-danger={type === 'error'}
    class:is-info={type === 'info'}>
    <div class="alert-grid">
        <span
            aria-hidden="true"
            class:icon-check-circle={type === 'success'}
            class:icon-exclamation={type === 'warning'}
            class:icon-exclamation-circle={type === 'error'}
            class:icon-info={type === 'info' || type === 'default'}></span>

        <div class="alert-content">
            {#if title || $$slots.title}
                <h6 class="alert-title">
                    <slot name="title">
                        {title}
                    </slot>
                </h6>
            {/if}
            <p class="alert-message">
                <slot />
            </p>
        </div>
        {#if $$slots.buttons}
            <div class="alert-buttons u-flex u-gap-16 u-cross-child-center">
                <slot name="buttons" />
            </div>
        {/if}
    </div>
</section>

<style>
    .alert {
        padding: 1rem 1rem 0.75rem 1.5rem;
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 100;
    }

    .alert-content {
        gap: 0.25rem;
    }
</style>
