<script lang="ts">
    import { Card, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addPlatform, Platform } from './platforms/+page.svelte';

    export let projectId: string;
</script>

<CardGrid>
    <h6 class="heading-level-7">Add a Platform to Get Started</h6>
    <p>Our SDK's make it possible to easily add any platform that you want to use.</p>
    <svelte:fragment slot="aside">
        <div class="grid-box " style="--grid-gap:1.5rem; --grid-item-size:12rem;">
            <Card isTile on:click={() => addPlatform(Platform.Web)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-code" />
                    </span>
                    <span>Web App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isTile on:click={() => addPlatform(Platform.Flutter)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-flutter" />
                    </span>
                    <span>Flutter App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isTile on:click={() => addPlatform(Platform.Apple)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-apple" />
                    </span>
                    <span>Apple App</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isTile on:click={() => addPlatform(Platform.Android)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-android" />
                    </span>
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
            <Card isTile on:click={() => addPlatform(Platform.Android)}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-code" />
                    </span>
                    <span>API Key</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
            <Card isTile href={`/console/project-${projectId}/webhooks`}>
                <div class="u-flex u-cross-center u-gap-12">
                    <span class="button is-secondary is-only-icon">
                        <span class="icon icon-code" />
                    </span>
                    <span>Webhook</span>
                    <span
                        class="icon-plus u-margin-inline-start-auto"
                        style="font-size: var(--icon-size-large);" />
                </div>
            </Card>
        </div>
    </svelte:fragment>
</CardGrid>

<article class="card u-grid u-cross-center u-width-full-line common-section">
    <div class="common-section u-main-center u-flex">
        <Button secondary round>
            <i class="icon-lock-closed" />
        </Button>
    </div>
    <div class="common-section">
        <div class="u-flex u-flex-vertical u-cross-center">
            <div class="common-section">
                <h7 class="heading-level-7">Add a Platform to View Data About Your Project</h7>
            </div>
            <div class="common-section">
                Get insights on bandwidth usage, requests, realtime connections and more after
                making your first API call
            </div>
        </div>
    </div>
</article>
