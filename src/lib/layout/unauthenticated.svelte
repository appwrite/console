<script lang="ts">
    import AppwriteLogo from '$lib/images/appwrite.svg';
    import LoginLight from '$lib/images/login/login-light-mode.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.svg';
    import { app } from '$lib/stores/app';
    import { base } from '$app/paths';
    import { user } from '$lib/stores/user';
    import LoginLight from '$lib/images/login/login-light-mode.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.svg';
    import { sdkForConsole } from '$lib/stores/sdk';

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
    <section class="grid-1-1-col-1 u-flex u-flex-vertical">
        <div
            class="container u-margin-block-start-20"
            style="--p-container-max-size: var(--container-size-medium);">
            <a href={user ? '/console' : '/'}>
                <img src={AppwriteLogo} width="196" height="47" class="u-block" alt="Appwrite" />
            </a>
        </div>

        <div class="u-margin-block-start-auto" />

        <div class="u-margin-block-start-auto is-not-mobile" />
        <div
            class="container u-margin-block-start-20 is-not-mobile"
            style="--p-container-max-size: var(--container-size-large);">
            {#if $app.themeInUse === 'dark'}
                <img src={imgDark} alt="" class="u-only-dark" />
            {:else}
                <img src={imgLight} alt="" class="u-only-light" />
            {/if}
        </div>

        <div class="u-margin-block-start-auto" />

        <div class="u-margin-block-start-auto is-not-mobile" />
        <div
            class="container u-color-text-gray is-not-mobile"
            style="--p-container-max-size:var(--container-size-small); --p-container-padding-inline:1rem;">
            <p>Integrate with your favourite technologies</p>
            <ul
                class="u-flex u-main-center u-flex-wrap u-gap-16 u-margin-block-start-32 u-line-height-1 u-opacity-50">
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
