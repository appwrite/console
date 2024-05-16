<script lang="ts">
    import { Heading } from '$lib/components';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';

    export const imgLight = LoginLight;
    export const imgDark = LoginDark;

    export let variation: 'default' | 'gradient' = 'gradient';
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section
        class="u-flex u-flex-vertical"
        class:side-bg={variation === 'gradient'}
        style:--url={variation === 'gradient'
            ? ''
            : `url(${$app.themeInUse === 'dark' ? imgDark : imgLight})`}>
        <div
            class="logo u-flex u-gap-16 is-not-mobile"
            class:u-margin-inline-auto={variation === 'gradient'}
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
        {:else if variation === 'gradient'}
            <div class="u-flex u-flex-vertical u-main-center u-cross-center" style=" height: 100%">
                {#if $app.themeInUse === 'dark'}
                    <img
                        src="/images/3D-card-illust-dark.png"
                        class="u-block"
                        width="401"
                        height="243"
                        alt="promo" />
                {:else}
                    <img
                        src="/images/3D-card-illust-light.png"
                        class="u-block"
                        width="401"
                        height="243"
                        alt="promo" />
                {/if}
                <div class="u-text-center">
                    <Heading size="4" tag="h3" class="u-margin-block-start-56">
                        You've received $15 in credits
                    </Heading>
                    <p class="body-text-1 u-margin-block-start-8">
                        Get $15 in credits when you sign up and create an organization with a Pro
                        plan.
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
        background-color: #ededf0;
        overflow: hidden;
    }
    .side-bg::before {
        position: absolute;
        // inset-block-start: -950px;
        inset-block-start: -1450px;
        inset-inline-end: -650px;
        content: '';
        display: block;
        inline-size: 100%;
        block-size: 100%;
        background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
        filter: blur(250px);
        @media #{$break1} {
            // inset-block-start: -200px;
            inset-block-start: -500px;
            inset-inline-end: -400px;
            filter: blur(100px);
        }
    }
    .side-bg::after {
        position: absolute;
        // inset-block-end: -850px;
        inset-block-end: -1250px;
        inset-inline-start: -600px;
        content: '';
        display: block;
        inline-size: 100%;
        block-size: 100%;
        background: radial-gradient(50% 46.73% at 50% 53.27%, #fe9567 28.17%, #fd366e 59.38%);
        filter: blur(250px);

        @media #{$break1} {
            // inset-block-end: -200px;
            inset-block-end: -400px;
            inset-inline-start: -400px;
            filter: blur(100px);
        }
    }
    :global(.theme-dark) .side-bg {
        background-color: #19191d;
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
