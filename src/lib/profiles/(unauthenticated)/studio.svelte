<script lang="ts">
    import { resolve } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { Typography, Card } from '@appwrite.io/pink-svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import UnicornScene from './studio.json?url';
    import { onDestroy, onMount } from 'svelte';
    import { Tween } from 'svelte/motion';

    async function isUnicornAvailable() {
        return new Promise((resolve) => {
            setInterval(() => {
                if ('UnicornStudio' in globalThis) resolve(true);
            }, 5);
            setTimeout(() => {
                resolve(false);
            }, 2500);
        });
    }

    const opacity = new Tween(0);

    onMount(async () => {
        if ('UnicornStudio' in window) delete window.UnicornStudio;
        await isUnicornAvailable();
        // @ts-expect-error the typings are trash
        // eslint-disable-next-line no-undef
        await UnicornStudio.init();
        opacity.target = 1;
    });

    onDestroy(() => {
        // @ts-expect-error the typings are trash
        delete window.UnicornStudio;
    });
</script>

<svelte:head>
    <script
        defer
        type="text/javascript"
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js"></script>
</svelte:head>

<main class="grid-1-1 is-full-page" id="main" style:background="#0f0f0f">
    <div
        class="unicorn-scene"
        style:opacity={opacity.current}
        data-us-scale="1"
        data-us-dpi="1.5"
        data-us-lazyload="true"
        data-us-production="true"
        data-us-alttext="Welcome to Imagine"
        data-us-project-src={UnicornScene}>
    </div>

    <section
        class="grid-1-1-col-2 form-section u-flex u-flex-vertical u-cross-center u-main-center">
        <slot name="top" />
        <div class="container u-flex u-flex-vertical u-cross-center u-main-center u-gap-32">
            <Typography.Title size="l">Welcome to Imagine</Typography.Title>
            <div class="auth-container u-width-full-line">
                <Card.Base>
                    <slot />
                </Card.Base>
                <ul
                    class="inline-links is-center is-with-sep u-margin-block-start-32"
                    class:u-hide={!$$slots?.links}>
                    <slot name="links" />
                </ul>
            </div>
            <div
                class="logo u-flex u-gap-16 u-margin-inline-auto is-only-mobile u-margin-block-start-32 mobile-logo">
                <a href={resolve('/')}>
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={resolvedProfile.logo.src.dark}
                            width="120"
                            class="u-block u-only-dark"
                            alt={resolvedProfile.logo.alt} />
                    {:else}
                        <img
                            src={resolvedProfile.logo.src.light}
                            width="120"
                            class="u-block u-only-light"
                            alt={resolvedProfile.logo.alt} />
                    {/if}
                </a>
            </div>
        </div>
    </section>
</main>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    .auth-container {
        max-inline-size: 27.5rem;

        @media #{devices.$break1} {
            margin-block-end: 5rem;
            margin-block-start: 2rem;
        }
    }

    // mobile logo positioned at bottom in mobile view
    .mobile-logo {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        margin-block-start: 0 !important;

        @media #{devices.$break1} {
            position: fixed;
        }
    }

    .unicorn-scene {
        max-width: 50vw;
        @media #{devices.$break1} {
            display: none;
        }
    }

    .form-section {
        @media #{devices.$break1} {
            width: 100%;
        }
    }

    .container {
        @media #{devices.$break1} {
            min-height: 100%;
            position: relative;
        }
    }

    main {
        @media #{devices.$break1} {
            display: flex;
            position: relative;
            align-items: center;
            justify-content: center;
        }
    }
</style>
