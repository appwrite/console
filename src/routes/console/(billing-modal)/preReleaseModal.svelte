<script lang="ts">
    import { Box, ModalSideCol } from '$lib/components';
    import SideLight from './side-light.png';
    import SideDark from './side-dark.png';
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import { trackEvent } from '$lib/actions/analytics';

    export let show = false;
</script>

<ModalSideCol bind:show title="Get ready for Appwrite Pro" style="max-width: min(53rem,95%)">
    <svelte:fragment slot="side">
        {#if $app.themeInUse === 'dark'}
            <img
                src={SideDark}
                style="object-fit: cover;   object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {:else}
            <img
                src={SideLight}
                style="object-fit: cover;   object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {/if}
    </svelte:fragment>

    <div class="u-flex u-flex-vertical u-gap-16">
        <p class="text">
            Appwrite will enable billing before the end of the year, which means access to our long
            awaited Pro plan. It also means you will be limited to <b
                >one free organization per account</b
            >.
        </p>
        <p class="text">
            Consider upgrading and take advantage of the extra resources that come with the Pro
            plan. You can also use our Migrations service to self-host some of your projects
            instead. Learn more in our <a
                class="link"
                href="https://appwrite.io/docs/advanced/migrations"
                target="_blank"
                rel="noopener noreferrer"
                on:click={() =>
                    trackEvent('click_open_website', {
                        source: 'pre_billing_release_modal',
                        destination: 'docs_migration'
                    })}>documentation</a
            >.
        </p>
    </div>
    <Box>
        <b class="body-text-1">Pro - $15 per member per billing period</b>

        <ul class="list u-flex-vertical u-gap-8 u-margin-block-start-24">
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">Unlimited org. members</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">300GB bandwidth</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">200,000 monthly active users</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">Email support</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">And more</span>
            </li>
        </ul>
        <Button
            fullWidth
            class="u-margin-block-start-24"
            href="https://appwrite.io/pricing"
            on:click={() =>
                trackEvent('click_open_website', {
                    source: 'pre_billing_release_modal',
                    destination: 'pricing'
                })}>
            Learn more about Pro
        </Button>
    </Box>
</ModalSideCol>
