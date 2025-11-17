<script lang="ts">
    import { resolve } from '$app/paths';
    import LoginBackground from '$lib/images/login/login-studio.png';
    import { app } from '$lib/stores/app';
    import { Typography, Card } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    export const imgLight = LoginBackground;
    export const imgDark = LoginBackground;
    export let align: 'start' | 'center' | 'end' = 'start';
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section
        class={`u-flex u-flex-vertical ${!$isSmallViewport ? 'side-default' : ''}`}
        style:--url={`url(${$app.themeInUse === 'dark' ? imgDark : imgLight})`}>
    </section>
    <section class="grid-1-1-col-2 u-flex u-flex-vertical u-cross-center u-main-center">
        <slot name="top" />
        <div class="container u-flex u-flex-vertical u-cross-center u-main-center u-gap-32">
            <Typography.Title size="l" {align}>Welcome to Imagine</Typography.Title>
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

    .side-bg {
        position: relative;
        overflow: hidden;
        z-index: 1;
        height: 100%;
        width: 100%;
        padding-block: 2rem;
        padding-inline: 1rem;
        background-color: #ededf0 !important;

        &-container {
            position: absolute;
            inset: 0;
            block-size: 100%;
            inline-size: 100%;
            z-index: -1;
            &::before {
                position: absolute;
                inset-block-start: -200px;
                inset-inline-end: -50px;
                content: '';
                display: block;
                inline-size: 32%;
                block-size: 32%;
                background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
                filter: blur(150px);
                @media #{devices.$break1} {
                    filter: blur(100px);
                }
            }
            &::after {
                position: absolute;
                inset-block-end: -50px;
                inset-inline-start: -50px;
                content: '';
                display: block;
                inline-size: 30%;
                block-size: 30%;
                background: radial-gradient(
                    50% 46.73% at 50% 53.27%,
                    #fe9567 28.17%,
                    #fd366e 59.38%
                );
                filter: blur(200px);

                @media #{devices.$break1} {
                    filter: blur(100px);
                }
            }
        }
        &-img {
            padding-inline: 6.25rem;
            max-width: 40rem;
            @media #{devices.$break2} {
                max-width: 28rem;
            }
            @media #{devices.$break1} {
                margin-block-start: 3rem;
                max-inline-size: 23rem;
                padding-inline: 4rem;
            }
        }
    }
    :global(.theme-dark) .side-bg {
        background-color: #131315 !important;
    }

    :global(.theme-dark) .side-bg-container::before {
        inline-size: 20%;
        block-size: 20%;
        filter: blur(180px);
    }
    :global(.theme-dark) .side-bg-container::after {
        filter: blur(250px);
    }

    /* Default (including mobile) */
    .side-default {
        padding-block-start: 2.25rem;
        padding-block-end: 2rem;
    }

    /* for smaller screens */
    @media #{devices.$break2open} {
        .side-default {
            background: var(--url);
            background-repeat: no-repeat;
            background-position: top;
            background-size: cover;

            padding-block-start: 6.25rem;
            padding-block-end: 6.875rem;
        }
    }

    :global(.theme-dark) .tag-line {
        background: linear-gradient(45deg, white, white 60%, #fd376f);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    :global(.theme-light) .tag-line {
        background: linear-gradient(45deg, #19191d, #19191d 60%, #fd376f);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .auth-container {
        max-inline-size: 27.5rem;
    }
    .review-container {
        max-inline-size: 30rem;
    }

    .review-footer-container {
        padding-block-start: 10rem;
        @media #{devices.$break1} {
            padding-block-start: 5rem;
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
    }

    @media #{devices.$break1} {
        .auth-container {
            margin-block-end: 5rem;
            margin-block-start: 2rem;
        }

        .container {
            min-height: 100%;
            position: relative;
        }
    }
</style>
