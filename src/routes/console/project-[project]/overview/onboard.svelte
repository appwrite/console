<script lang="ts">
    import { Card, CardGrid } from '$lib/components';
    import { addPlatform, Platform } from './platforms/+page.svelte';
    import OnboardDark1 from './onboard-1-dark.svg';
    import OnboardDark2 from './onboard-2-dark.svg';
    import OnboardLight1 from './onboard-1-light.svg';
    import OnboardLight2 from './onboard-2-light.svg';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import Wizard from './keys/wizard.svelte';

    export let projectId: string;

    function createKey() {
        wizard.start(Wizard);
    }

    $: onBoardImage1 = $app.themeInUse === 'dark' ? OnboardDark1 : OnboardLight1;
    $: onBoardImage2 = $app.themeInUse === 'dark' ? OnboardDark2 : OnboardLight2;
</script>

<CardGrid>
    <h6 class="heading-level-7">Add a Platform to Get Started</h6>
    <p>Our SDK's make it possible to easily add any platform that you want to use.</p>
    <svelte:fragment slot="aside">
        <div class="grid-box " style="--grid-gap:1.5rem; --grid-item-size:12rem;">
            <Card isButton isTile on:click={() => addPlatform(Platform.Web)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`/icons/${$app.themeInUse}/grayscale/code.svg`}
                            alt="technology" />
                    </div>
                    <span>Web App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isButton isTile on:click={() => addPlatform(Platform.Flutter)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img src={`/icons/${$app.themeInUse}/color/flutter.svg`} alt="technology" />
                    </div>
                    <span>Flutter App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isButton isTile on:click={() => addPlatform(Platform.Apple)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img src={`/icons/${$app.themeInUse}/color/apple.svg`} alt="technology" />
                    </div>
                    <span>Apple App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isButton isTile on:click={() => addPlatform(Platform.Android)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img src={`/icons/${$app.themeInUse}/color/android.svg`} alt="technology" />
                    </div>
                    <span>Android App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
        </div>
    </svelte:fragment>
</CardGrid>
<CardGrid>
    <h6 class="heading-level-7">Integrate With Your Server</h6>
    <p>Our SDK's make it possible to easily add any platform that you want to use.</p>
    <svelte:fragment slot="aside">
        <div class="grid-box " style="--grid-gap:1.5rem; --grid-item-size:12rem;">
            <Card isButton isTile on:click={createKey}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`/icons/${$app.themeInUse}/grayscale/code.svg`}
                            alt="technology" />
                    </div>
                    <span>API Key</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isTile href={`/console/project-${projectId}/settings/webhooks`}>
                <div class="u-flex u-cross-center u-gap-12">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`/icons/${$app.themeInUse}/grayscale/code.svg`}
                            alt="technology" />
                    </div>
                    <span>Webhook</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
        </div>
    </svelte:fragment>
</CardGrid>

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

<img src={onBoardImage2} class="common-section" alt="Statistics Preview" />

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
