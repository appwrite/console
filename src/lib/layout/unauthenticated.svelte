<script lang="ts">
    import { Heading } from '$lib/components';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import type { Coupon } from '$lib/sdk/billing';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';

    export const imgLight = LoginLight;
    export const imgDark = LoginDark;

    export let coupon: Coupon = null;

    $: variation = coupon?.code ? 'card' : 'default';
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section
        class="u-flex u-flex-vertical"
        class:side-bg={variation === 'card'}
        style:--url={variation === 'card'
            ? ''
            : `url(${$app.themeInUse === 'dark' ? imgDark : imgLight})`}>
        <div class="side-bg-container" />
        <div
            class="logo u-flex u-gap-16 is-not-mobile"
            class:u-margin-inline-auto={variation === 'card'}
            style="z-index: 10">
            <a href={user ? '/console' : '/'}>
                {#if $app.themeInUse === 'dark'}
                    <img
                        src={AppwriteLogoDark}
                        width="160"
                        class="u-block u-only-dark"
                        alt="Appwrite Logo" />
                {:else}
                    <img
                        src={AppwriteLogoLight}
                        width="160"
                        class="u-block u-only-light"
                        alt="Appwrite Logo" />
                {/if}
            </a>
        </div>

        {#if variation === 'default'}
            <div class="u-flex u-stretch" />

            <div class="tag-line is-not-mobile">
                <p>Build like a team of hundreds<span class="underscore">_</span></p>
            </div>
        {:else if variation === 'card'}
            <div class="u-flex u-flex-vertical u-main-center u-cross-center u-height-100-percent">
                <img
                    src={`/images/campaigns/${coupon.campaign}/${$app.themeInUse}.png`}
                    class="u-block u-image-object-fit-cover"
                    alt="promo" />

                <div class="u-text-center">
                    <Heading size="4" tag="h3" class="u-margin-block-start-56">
                        You've received ${coupon.credits} in credits
                    </Heading>
                    <p class="body-text-1 u-margin-block-start-8">
                        Get ${coupon.credits} in credits when you upgrade or create an organization with
                        a Pro plan.
                    </p>
                </div>
            </div>
        {/if}
    </section>
    <section class="grid-1-1-col-2 u-flex u-flex-vertical u-cross-center u-main-center">
        <slot name="top" />
        <div class="container u-flex u-flex-vertical u-cross-center u-main-center">
            <div class="form-container u-width-full-line">
                <h1 class="heading-level-4 u-margin-block-start-auto is-not-mobile">
                    <slot name="title" />
                </h1>
                <h1 class="heading-level-5 u-margin-block-start-auto is-only-mobile">
                    <slot name="title" />
                </h1>
                <div class="u-margin-block-start-24">
                    <slot />
                </div>

                <ul
                    class="inline-links is-center is-with-sep u-margin-block-start-32"
                    class:u-hide={!$$slots.links}>
                    <slot name="links" />
                </ul>
            </div>
            <div
                class="logo u-flex u-gap-16 u-margin-inline-auto is-only-mobile u-margin-block-start-32">
                <a href={user ? '/console' : '/'}>
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={AppwriteLogoDark}
                            width="93"
                            class="u-block u-only-dark"
                            alt="Appwrite Logo" />
                    {:else}
                        <img
                            src={AppwriteLogoLight}
                            width="93"
                            class="u-block u-only-light"
                            alt="Appwrite Logo" />
                    {/if}
                </a>
            </div>
        </div>
    </section>
</main>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    @import '@appwrite.io/pink/src/abstract/variables/_common.scss';

    .side-bg {
        position: relative;
        overflow: hidden;
        z-index: 1;
        height: 100%;
        width: 100%;
    }
    .side-bg-container {
        position: absolute;
        inset: 0;
        block-size: 100%;
        inline-size: 100%;
        z-index: -1;
    }
    .side-bg-container::before {
        position: absolute;
        inset-block-start: -10px;
        inset-inline-end: -10px;
        content: '';
        display: block;
        inline-size: 30%;
        block-size: 30%;
        background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
        filter: blur(250px);
        @media #{$break1} {
            filter: blur(100px);
        }
    }
    .side-bg-container::after {
        position: absolute;
        inset-block-end: -10px;
        inset-inline-start: -10px;
        content: '';
        display: block;
        inline-size: 30%;
        block-size: 30%;
        background: radial-gradient(50% 46.73% at 50% 53.27%, #fe9567 28.17%, #fd366e 59.38%);
        filter: blur(250px);

        @media #{$break1} {
            filter: blur(100px);
        }
    }

    /* Default (including mobile) */
    #main section:first-child {
        padding-block-start: 2.25rem;
        padding-block-end: 2rem;

        div {
            padding-inline-start: 1rem;
            padding-inline-end: 1rem;
        }

        .tag-line {
            font-family: 'Aeonik Pro';
            font-size: 4rem;
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 80px */
            letter-spacing: -1.6px;
            backdrop-filter: blur(0.5 rem);
            .underscore {
                -webkit-text-fill-color: #f02e65;
            }
        }
    }

    /* for smaller screens */
    @media #{$break2open} {
        #main section:first-child {
            background: var(--url);
            background-repeat: no-repeat;
            background-position: top;
            background-size: cover;

            padding-block-start: 6.25rem;
            padding-block-end: 6.875rem;

            div {
                padding-inline-start: 2.625rem;
                padding-inline-end: 2rem;
            }
        }
    }

    /* for larger screens */
    @media #{$break3open} {
        #main section:first-child {
            div {
                padding-inline-start: 5.625rem;
                padding-inline-end: 5rem;
            }
            .tag-line {
                font-size: 5rem;
            }
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

    .form-container {
        max-inline-size: 27.5rem;
    }
</style>
