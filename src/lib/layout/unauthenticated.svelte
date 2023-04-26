<script lang="ts">
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { isCloud } from '$lib/system';
    import LoginDark from '$lib/images/login/login-dark-mode.svg';
    import LoginLight from '$lib/images/login/login-light-mode.svg';
    import AppwriteLogo from '$lib/images/appwrite.svg';
    import AppwriteCloudLogo from '$lib/images/appwrite-cloud.svg';
    import AppwriteCloudBg from '$lib/images/login/cloud-bg.svg';
    import Cloud1 from '$lib/images/login/cloud-1.svg';
    import Cloud2 from '$lib/images/login/cloud-2.svg';

    export let imgLight = LoginLight;
    export let imgDark = LoginDark;

    const technologies = [
        'js',
        'flutter',
        'apple',
        'android',
        'node',
        'php',
        'python',
        'ruby',
        'dart',
        'kotlin',
        'swift'
    ];

    function onGithubLogin() {
        sdkForConsole.account.createOAuth2Session(
            'github',
            window.location.origin,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }
</script>

<main class="grid-1-1 is-full-page" id="main">
    {#if isCloud}
        <section
            class="grid-1-1-col-1 u-flex u-flex-vertical cloud-section u-overflow-hidden"
            style:--url={`url(${AppwriteCloudBg})`}>
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />

            <a class="logo" href={user ? '/console' : '/'}>
                <img
                    src={AppwriteCloudLogo}
                    width="196"
                    height="47"
                    class="u-block"
                    alt="Appwrite" />
            </a>

            <div class="header">
                <p>Cloud is Live</p>
                <img src={Cloud1} alt="" class="cloud-1" />
                <img src={Cloud2} alt="" class="cloud-2" />
            </div>

            <div class="u-margin-block-start-auto" />

            <p class="beta">Now in public <span>beta</span></p>

            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />
            <div class="u-margin-block-start-auto" />

            <div class="u-margin-block-start-auto is-no-mobile" />
            <div
                class="container u-text-color-light-gray is-no-mobile"
                style="--p-container-max-size:var(--container-size-small); --p-container-padding-inline:1rem;">
                <p>Integrate with your favourite technologies</p>
                <ul
                    class="u-flex u-main-center u-flex-wrap u-gap-16 u-margin-block-start-32 u-line-height-1 u-opacity-0-5">
                    {#each technologies as tech}
                        <li>
                            <img
                                src={`${base}/icons/${$app.themeInUse}/grayscale/${tech}.svg`}
                                alt={tech}
                                aria-hidden="true"
                                aria-label={tech} />
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="u-margin-block-start-40" />
        </section>
    {:else}
        <section class="grid-1-1-col-1 u-flex u-flex-vertical">
            <div
                class="container u-margin-block-start-20"
                style="--p-container-max-size: var(--container-size-medium);">
                <a href={user ? '/console' : '/'}>
                    <img
                        src={AppwriteLogo}
                        width="196"
                        height="47"
                        class="u-block"
                        alt="Appwrite" />
                </a>
            </div>

            <div class="u-margin-block-start-auto" />

            <div class="u-margin-block-start-auto is-no-mobile" />
            <div
                class="container u-margin-block-start-20 is-no-mobile u-flex u-main-center"
                style="--p-container-max-size: var(--container-size-large);">
                {#if $app.themeInUse === 'dark'}
                    <img src={imgDark} alt="" class="u-only-dark" />
                {:else}
                    <img src={imgLight} alt="" class="u-only-light" />
                {/if}
            </div>

            <div class="u-margin-block-start-auto" />

            <div class="u-margin-block-start-auto is-no-mobile" />
            <div
                class="container u-text-color-light-gray is-no-mobile"
                style="--p-container-max-size:var(--container-size-small); --p-container-padding-inline:1rem;">
                <p>Integrate with your favourite technologies</p>
                <ul
                    class="u-flex u-main-center u-flex-wrap u-gap-16 u-margin-block-start-32 u-line-height-1 u-opacity-0-5">
                    {#each technologies as tech}
                        <li>
                            <img
                                src={`${base}/icons/${$app.themeInUse}/grayscale/${tech}.svg`}
                                alt={tech}
                                aria-hidden="true"
                                aria-label={tech} />
                        </li>
                    {/each}
                </ul>
            </div>
            <div class="u-margin-block-start-40" />
        </section>
    {/if}
    <section class="grid-1-1-col-2 u-flex u-main-center u-cross-center">
        <div class="container u-flex u-flex-vertical u-cross-center u-height-100-percent">
            <div class="u-margin-block-start-auto" />

            <div class="u-max-width-500 u-width-full-line">
                <h1 class="heading-level-3 u-margin-block-start-auto"><slot name="title" /></h1>
                <div class="u-margin-block-start-40">
                    <slot />
                </div>

                <ul class="inline-links is-center is-with-sep u-margin-block-start-32">
                    <slot name="links" />
                </ul>
            </div>

            <p class="u-margin-block-start-20">Or sign in with:</p>

            <div class="u-margin-block-start-16 u-flex u-gap-12">
                <button on:click={onGithubLogin} class="button is-secondary">
                    <span class="text">GitHub</span>
                </button>
            </div>

            <div class="u-margin-block-start-auto" />
            <p class="u-max-width-500 u-width-full-line u-margin-block-start-24">
                <!-- version 0.15.2.402 -->
            </p>
            <div class="u-margin-block-start-20" />
        </div>
    </section>
</main>

<style lang="scss">
    @keyframes float {
        0% {
            transform: translatey(0px);
        }
        50% {
            transform: translatey(-8px);
        }
        100% {
            transform: translatey(0px);
        }
    }

    .cloud-section {
        background: var(--url);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        color: hsl(var(--color-neutral-5));

        .logo {
            display: block;
            align-self: center;
        }

        .header {
            text-align: center;
            align-self: center;
            position: relative;

            p {
                font-family: 'Poppins';
                font-size: clamp(3.5rem, 7vw, 5.25rem);
                font-weight: 700;
            }

            .cloud-1 {
                position: absolute;
                top: 95%;
                left: 0;
                translate: 15% -50%;
                animation: float 6s ease-in-out infinite;
            }

            .cloud-2 {
                position: absolute;
                top: 110%;
                right: 0;
                translate: 20% -50%;
                animation: float 7s ease-in-out infinite;
                animation-delay: 3s;
            }
        }

        .beta {
            text-align: center;
            align-self: center;
            font-family: 'Poppins';
            font-size: 1.125rem;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 130%;
            letter-spacing: 0.25em;

            > span {
                background: linear-gradient(
                    180deg,
                    rgba(252, 252, 255, 0.5) 0%,
                    rgba(252, 252, 255, 0.25) 100%
                );
                border-radius: 5.38636px;
                text-align: center;
                padding: 0.5rem 0.5rem 0.5rem 0.75rem;
            }
        }
    }
</style>
