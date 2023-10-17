<script lang="ts">
    import { addPlatform, Platform } from './platforms/+page.svelte';
    import OnboardDarkIntro from './intro-dark.png';
    import OnboardLightIntro from './intro-light.png';
    import OnboardDark1Desktop from './onboard-1-dark-desktop.svg';
    import OnboardDark1Mobile from './onboard-1-dark-mobile.svg';
    import OnboardLight1Desktop from './onboard-1-light-desktop.svg';
    import OnboardLight1Mobile from './onboard-1-light-mobile.svg';
    import OnboardDark2Desktop from './onboard-2-dark-desktop.svg';
    import OnboardDark2Mobile from './onboard-2-dark-mobile.svg';
    import OnboardLight2Desktop from './onboard-2-light-desktop.svg';
    import OnboardLight2Mobile from './onboard-2-light-mobile.svg';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import Wizard from './keys/wizard.svelte';

    export let projectId: string;

    const platforms = [
        {
            title: 'Web',
            icon: 'grayscale/code',
            platform: Platform.Web
        },
        {
            title: 'Flutter',
            icon: 'color/flutter',
            platform: Platform.Flutter
        },
        {
            title: 'Apple',
            icon: 'color/apple',
            platform: Platform.Apple
        },
        {
            title: 'Android',
            icon: 'color/android',
            platform: Platform.Android
        }
    ];

    function createKey() {
        wizard.start(Wizard);
    }

    $: onBoardIntro = $app.themeInUse === 'dark' ? OnboardDarkIntro : OnboardLightIntro;
    $: onBoardImage1Mobile = $app.themeInUse === 'dark' ? OnboardDark1Mobile : OnboardLight1Mobile;
    $: onBoardImage1Desktop =
        $app.themeInUse === 'dark' ? OnboardDark1Desktop : OnboardLight1Desktop;
    $: onBoardImage2Mobile = $app.themeInUse === 'dark' ? OnboardDark2Mobile : OnboardLight2Mobile;
    $: onBoardImage2Desktop =
        $app.themeInUse === 'dark' ? OnboardDark2Desktop : OnboardLight2Desktop;
</script>

<div class="card">
    <header class="card-header common-section grid-1-2" style:--url={`url(${onBoardIntro})`}>
        <div class="grid-1-2-col-1">
            <h2 class="heading-level-5">Getting started</h2>
            <p class="u-line-height-1-5 u-margin-block-start-12">
                Here are some next steps to start building
            </p>
        </div>
    </header>

    <section class="common-section card-separator grid-1-2">
        <div class="grid-1-2-col-1">
            <h3 class="heading-level-7">Add a platform</h3>
            <p class="u-line-height-1-5 u-margin-block-start-16">
                Our SDKs make it possible to easily integrate with any platform.
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
            <h3 class="heading-level-7">Integrate with your server</h3>
            <p class="u-line-height-1-5 u-margin-block-start-16">
                Appwrite is designed to adapt to your existing backend. Integrate Appwrite with your
                backend code base using Server SDKs or Webhooks.
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
                            <span class="text">API key</span>
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

<article class="card u-grid u-width-full-line common-section onboard-cover">
    <img src={onBoardImage1Mobile} class="is-only-mobile u-width-full-line" alt="statistics" />
    <img src={onBoardImage1Desktop} class="is-not-mobile u-width-full-line" alt="statistics" />
    <div class="u-height-100-percent u-width-full-line u-padding-block-start-20">
        <div class="u-flex u-flex-vertical u-height-100-percent u-cross-center u-padding-inline-24">
            <div class="avatar">
                <i class="icon-lock-closed" />
            </div>
            <div class="common-section u-text-center">
                <h7 class="heading-level-7">Add a platform to view data about your project</h7>
            </div>
        </div>
    </div>
</article>

<img
    src={onBoardImage2Mobile}
    class="common-section is-only-mobile u-width-full-line"
    alt="statistics" />
<img
    src={onBoardImage2Desktop}
    class="common-section is-not-mobile u-width-full-line"
    alt="statistics" />

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';

    @media #{$break2open} {
        .card-header {
            background-image: var(--url);
            background-repeat: no-repeat;
            background-position: top right;
        }
    }

    .onboard-cover > div {
        background-color: transparent;
        z-index: 1;
        position: absolute;

        @media #{$break1} {
            margin-block-start: 15%;
        }

        @media #{$break2open} {
            margin-block-start: 2rem;
        }
    }
</style>
