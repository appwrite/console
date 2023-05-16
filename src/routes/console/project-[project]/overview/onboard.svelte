<script lang="ts">
    import { addPlatform, Platform } from './platforms/+page.svelte';
    import OnboardDarkIntro from './intro-dark.svg';
    import OnboardDark1 from './onboard-1-dark.svg';
    import OnboardDark2 from './onboard-2-dark.svg';
    import OnboardLightIntro from './intro-light.svg';
    import OnboardLight1 from './onboard-1-light.svg';
    import OnboardLight2 from './onboard-2-light.svg';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import Wizard from './keys/wizard.svelte';
    import { registerProjectCommand } from '../store';

    export let projectId: string;

    const platforms = [
        {
            title: 'Web App',
            icon: 'grayscale/code',
            platform: Platform.Web
        },
        {
            title: 'Flutter App',
            icon: 'color/flutter',
            platform: Platform.Flutter
        },
        {
            title: 'Apple App',
            icon: 'color/apple',
            platform: Platform.Apple
        },
        {
            title: 'Android App',
            icon: 'color/android',
            platform: Platform.Android
        }
    ];

    function createKey() {
        wizard.start(Wizard);
    }

    $: onBoardIntro = $app.themeInUse === 'dark' ? OnboardDarkIntro : OnboardLightIntro;
    $: onBoardImage1 = $app.themeInUse === 'dark' ? OnboardDark1 : OnboardLight1;
    $: onBoardImage2 = $app.themeInUse === 'dark' ? OnboardDark2 : OnboardLight2;

    $: $registerProjectCommand();
</script>

<div class="card">
    <header class="card-header common-section grid-1-2">
        <div class="grid-1-2-col-1">
            <h2 class="heading-level-5">Getting Started Guide</h2>
            <p class="u-line-height-1-5">Let's get your project up and running</p>
        </div>
        <div class="grid-1-2-col-2 u-flex u-main-end u-cross-end is-not-mobile">
            <img src={onBoardIntro} alt="" class="card-header-image" />
        </div>
    </header>

    <section class="common-section card-separator grid-1-2">
        <div class="grid-1-2-col-1">
            <h3 class="heading-level-7">Add a Platform</h3>
            <p class="u-line-height-1-5">
                Our SDK's make it possible to easily add any platform that you want to use.
            </p>
        </div>
        <div class="grid-1-2-col-2">
            <ul class="grid-box">
                {#each platforms as platform}
                    <li class="grid-box-item">
                        <button
                            type="button"
                            class="card u-width-full-line"
                            on:click={() => addPlatform(platform.platform)}>
                            <span class="u-flex u-cross-center u-gap-16">
                                <div class="avatar is-medium" aria-hidden="true">
                                    <img
                                        src={`/icons/${$app.themeInUse}/${platform.icon}.svg`}
                                        alt="technology" />
                                </div>
                                <span class="text">{platform.title}</span>
                                <span
                                    class="icon-plus u-margin-inline-start-auto"
                                    style="font-size: var(--icon-size-large);"
                                    aria-hidden="true" />
                            </span>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </section>

    <div class="separator-with-text">
        <span class="text">OR</span>
    </div>

    <section class="common-section grid-1-2">
        <div class="grid-1-2-col-1">
            <h3 class="heading-level-7">Integrate With Your Server</h3>
            <p class="u-line-height-1-5">
                Our SDK's make it possible to easily add any platform that you want to use.
            </p>
        </div>
        <div class="grid-1-2-col-2">
            <ul class="grid-box">
                <li class="grid-box-item">
                    <button type="button" class="card u-width-full-line" on:click={createKey}>
                        <span class="u-flex u-cross-center u-gap-16">
                            <div class="avatar is-medium" aria-hidden="true">
                                <img
                                    src={`/icons/${$app.themeInUse}/grayscale/code.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">API Key</span>
                            <span
                                class="icon-plus u-margin-inline-start-auto"
                                style="font-size: var(--icon-size-large);"
                                aria-hidden="true" />
                        </span>
                    </button>
                </li>
                <li class="grid-box-item">
                    <a
                        href={`/console/project-${projectId}/settings/webhooks`}
                        style="line-height: 1.5;"
                        class="card u-width-full-line">
                        <span class="u-flex u-cross-center u-gap-16">
                            <div class="avatar is-medium" aria-hidden="true">
                                <img
                                    src={`/icons/${$app.themeInUse}/grayscale/code.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">Webhook</span>
                            <span
                                class="icon-plus u-margin-inline-start-auto"
                                style="font-size: var(--icon-size-large);"
                                aria-hidden="true" />
                        </span>
                    </a>
                </li>
            </ul>
        </div>
    </section>
</div>

<article
    class="card u-grid u-width-full-line common-section onboard-cover"
    style={`background-image: url(${onBoardImage1});`}>
    <div class="u-flex u-flex-vertical u-cross-center">
        <div class="avatar">
            <i class="icon-lock-closed" />
        </div>
        <div class="common-section">
            <h7 class="heading-level-7">Add a Platform to View Data About Your Project</h7>
        </div>
        <div class="common-section">
            Get insights on bandwidth usage, requests, realtime connections and more after making
            your first API call
        </div>
    </div>
</article>

<img src={onBoardImage2} class="common-section" alt="statistics" />

<style>
    .onboard-cover {
        height: 342px;
        background: none;
        background-position: top center;
        background-size: 100% auto;
        background-repeat: no-repeat;
        border: none;
    }
</style>
