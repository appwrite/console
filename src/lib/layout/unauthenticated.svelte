<script lang="ts">
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';

    export const imgLight = LoginLight;
    export const imgDark = LoginDark;
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section class="u-flex u-flex-vertical side-bg">
        <div class="logo u-flex u-gap-16 u-margin-inline-auto is-not-mobile">
            <a href={$user ? '/console' : '/'}>
                {#if $app.themeInUse === 'dark'}
                    <img
                        src={AppwriteLogoDark}
                        width="123"
                        class="u-block u-only-dark"
                        alt="Appwrite Logo" />
                {:else}
                    <img
                        src={AppwriteLogoLight}
                        width="123"
                        class="u-block u-only-light"
                        alt="Appwrite Logo" />
                {/if}
            </a>
        </div>

        <div class="appwrite-pro-card">
            <img class="u-only-dark u-margin-inline-auto" src="/src/lib/images/login/card-mask-dark.svg" alt="">
            <img class="u-only-light u-margin-inline-auto" src="/src/lib/images/login/card-mask-light.svg" alt="">
        </div>

        <div class="u-flex-vertical u-gap-16 gradient-text">
            <h2 class="content-header">Walter has given you $15 in credits</h2>
            <p class="body-text-1 u-text-center u-max-width-350 u-margin-inline-auto" style="text-wrap: balance;">Get $15 in credits when you sign up and create  an organization with a Pro plan.</p>
        </div>
    </section>
    <section class="grid-1-1-col-2 u-flex u-main-center u-cross-center _u-padding-16-mobile">
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
    @import '@appwrite.io/pink/src/abstract/variables/_common.scss';
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    @import '@appwrite.io/pink/src/abstract/functions/_pxToRem.scss';

    /* mobile utility class */
    @media #{$break1} {
        ._u-padding-16-mobile {
            padding: pxToRem(16);
        }
    }

    .appwrite-pro-card {

        @media #{$break1} {
            margin-block-start:0;
          img { max-inline-size: pxToRem(270)}
        }
        @media #{$break2open} {
          margin-block-start: pxToRem(160);
        }
    }

    :global(.theme-dark) .appwrite-pro-card {

    }
    .gradient-text {
      background: linear-gradient(70deg, #fb5491 -35.72%, #19191d 79.96%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-inline: auto;
    }
    .content-header {
        position: relative;
        z-index: 1;
        background: linear-gradient(70deg, #fb5491 -35.72%, #19191d 79.96%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-inline: auto;
        text-align: center;

        @media #{$break1} {
            font-size: pxToRem(26);
            margin-block-start: pxToRem(24);
            max-inline-size: pxToRem(272);
        }
        @media #{$break2open} {
            font-size: pxToRem(28);
            margin-block-start: pxToRem(36);
        }
    }
    :global(.theme-dark) {
      .gradient-text {
        background: linear-gradient(89deg, #fb5491 -29.25%, #fff 43.27%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .content-header {
        background: linear-gradient(89deg, #fb5491 -29.25%, #fff 43.27%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .side-bg {
        position: relative;
        background-color: #ededf0;
        overflow: hidden;
    }
    .side-bg::before {
        position: absolute;
        inset-block-start: -950px;
        inset-inline-end: -650px;
        content: '';
        display: block;
        inline-size: 100%;
        block-size: 100%;
        background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
        filter: blur(250px);
        @media #{$break1} {
            inset-block-start: -200px;
            inset-inline-end: -400px;
            filter: blur(100px);
        }
    }
    .side-bg::after {
        position: absolute;
        inset-block-end: -850px;
        inset-inline-start: -600px;
        content: '';
        display: block;
        inline-size: 100%;
        block-size: 100%;
        background: radial-gradient(50% 46.73% at 50% 53.27%, #fe9567 28.17%, #fd366e 59.38%);
        filter: blur(250px);

        @media #{$break1} {
            inset-block-end: -200px;
            inset-inline-start: -400px;
            filter: blur(100px);
        }
    }
    :global(.theme-dark) .side-bg {
        background-color: #19191d;
    }

    /****** OLD ******/
    /* Default (including mobile) */
    #main section:first-child {
        padding-block-start: 2.25rem;
        padding-block-end: 2rem;

        div {
            padding-inline-start: 1rem;
            padding-inline-end: 1rem;
        }

        // .tag-line {
        //     font-family: 'Aeonik Pro';
        //     font-size: 4rem;
        //     font-style: normal;
        //     font-weight: 400;
        //     line-height: 100%; /* 80px */
        //     letter-spacing: -1.6px;
        //     backdrop-filter: blur(0.5 rem);
        //     .underscore {
        //         -webkit-text-fill-color: #f02e65;
        //     }
        // }
    }

    /* for smaller screens */
    @media #{$break2open} {
        #main section:first-child {
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
            // .tag-line {
            //     font-size: 5rem;
            // }
        }
    }
</style>
