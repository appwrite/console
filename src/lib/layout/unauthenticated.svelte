<script lang="ts">
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';
    import { isCloud } from '$lib/system';

    export let imgLight = LoginLight;
    export let imgDark = LoginDark;
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section
        class="u-flex u-flex-vertical"
        style:--url={`url(${$app.themeInUse === 'dark' ? imgDark : imgLight})`}>
        <div class="logo u-flex u-gap-16">
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
            {#if isCloud}
                <span class="aw-badges aw-eyebrow">Cloud Beta</span>
            {/if}
        </div>

        <div class="u-flex u-stretch" />

        <div class="tag-line is-not-mobile">
            <p>Build like a team of hundreds<span class="underscore">_</span></p>
        </div>
    </section>
    <section class="grid-1-1-col-2 u-flex u-main-center u-cross-center">
        <div class="container u-flex u-flex-vertical u-cross-center u-main-center">
            <div class="u-max-width-500 u-width-full-line">
                <h1 class="heading-level-2 u-margin-block-start-auto">
                    <slot name="title" />
                </h1>
                <div class="u-margin-block-start-24">
                    <slot />
                </div>

                <ul class="inline-links is-center is-with-sep u-margin-block-start-32">
                    <slot name="links" />
                </ul>
            </div>
        </div>
    </section>
</main>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';

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

    .aw-eyebrow {
        font-family: 'Source Code Pro', monospace;
        line-height: 0.9rem;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        font-weight: 400;
        text-transform: uppercase;
    }

    .aw-badges {
        --p-badges-shadow-bg-color: #f2c8d6;
        --p-badges-shadow-border-color: #f69db7;
        --p-badges-shadowopacity: 0.4;
        align-self: center;
        color: hsl(var(--color-neutral-0));
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        border-radius: 0.375rem;
        background: radial-gradient(
            98.13% 199.7% at 98.13% 100%,
            #fe6947 0%,
            #fd366e 41.6%,
            #fd366e 100%
        );
        -webkit-backdrop-filter: blur(2.5rem);
        backdrop-filter: blur(2.5rem);
        box-shadow:
            0.1875rem 0.1875rem var(--p-badges-shadow-bg-color),
            0.25rem 0.1875rem var(--p-badges-shadow-border-color),
            0.1875rem 0.25rem var(--p-badges-shadow-border-color),
            0.125rem 0.1875rem var(--p-badges-shadow-border-color),
            0.1875rem 0.125rem var(--p-badges-shadow-border-color);

        :global(.theme-dark) & {
            --p-badges-shadow-bg-color: #2c2c2f;
            --p-badges-shadow-border-color: #39393c;
            --p-badges-shadowopacity: 0.13;
        }

        :global(.theme-light) & {
            --p-badges-shadow-bg-color: #f2c8d6;
            --p-badges-shadow-border-color: #f69db7;
            --p-badges-shadowopacity: 0.4;
        }
    }
</style>
