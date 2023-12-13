<script lang="ts">
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';

    export let imgLight = LoginLight;
    export let imgDark = LoginDark;
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section class="u-flex u-flex-vertical side-bg">
        <div class="logo u-flex u-gap-16 u-margin-inline-auto is-not-mobile">
            <a href={user ? '/console' : '/'}>
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

        <div class="appwrite-pro">
            <span class="text">APPWRITE</span>
            <span class="appwrite-pro-text">
                <span class="appwrite-pro-text-letter">P</span><span
                    class="appwrite-pro-text-letter">R</span
                ><span class="appwrite-pro-text-letter">O</span></span>
        </div>

        <div class="now-available">Now available</div>
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

<!-- OLD one -->
<!--
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
-->

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

    .appwrite-pro {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: baseline;
        color: hsl(var(--color-neutral-100));

        @media #{$break1} {
            gap: pxToRem(10);
            font-size: pxToRem(18);
            letter-spacing: pxToRem(4);
        }
        @media #{$break2open} {
            gap: pxToRem(24);
            font-size: pxToRem(40);
            letter-spacing: pxToRem(8);
            line-height: 120%;
            margin-block-start: pxToRem(160);
        }

        &-text {
            padding: pxToRem(18) pxToRem(28);
            border: pxToRem(2) solid hsl(343 98% 60% / 0.2);
            border-radius: pxToRem(16);
            background: rgba(253, 54, 110, 0.1);
            box-shadow: 0 -12.173px 20.289px 0px rgba(253, 54, 110, 0.08) inset;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            &-letter {
                width: 2rem;
                @media #{$break1} {
                    width: 1rem;
                }
            }
            @media #{$break1} {
                padding: pxToRem(8) pxToRem(12);
                border-radius: pxToRem(8);
            }
        }
    }

    :global(.theme-dark) .appwrite-pro {
        color: hsl(var(--color-neutral-10));
    }

    .now-available {
        position: relative;
        z-index: 1;
        background: linear-gradient(70deg, #fb5491 -35.72%, #19191d 79.96%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-inline: auto;

        @media #{$break1} {
            font-size: pxToRem(18);
            margin-block-start: pxToRem(12);
        }
        @media #{$break2open} {
            font-size: pxToRem(30);
            margin-block-start: pxToRem(36);
        }
    }
    :global(.theme-dark) .now-available {
        background: linear-gradient(89deg, #fb5491 -29.25%, #fff 43.27%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
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
</style>
