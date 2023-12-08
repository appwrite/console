<script lang="ts">
    import { Box, ModalSideCol } from '$lib/components';
    import SideLight from './side-light.png';
    import SideDark from './side-dark.png';
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import { trackEvent } from '$lib/actions/analytics';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '../changeOrganizationTierCloud.svelte';
    import { user } from '$lib/stores/user';

    export let show = false;
    const today = new Date();

    //user creation date after the 12th of December 2023
    $: event =
        new Date($user.$createdAt) > new Date(2023, 11, 12)
            ? 'click_organization_upgrade'
            : 'pre_billing_release_modal_old';
</script>

<ModalSideCol bind:show title="Claim your Pro credit today" style="max-width: min(53rem,95%)">
    <svelte:fragment slot="side">
        {#if $app.themeInUse === 'dark'}
            <img
                src={SideDark}
                style="object-fit: cover; object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {:else}
            <img
                src={SideLight}
                style="object-fit: cover; object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {/if}
    </svelte:fragment>

    <div class="u-flex u-flex-vertical u-gap-16">
        <p class="text">
            Upgrade now and use the code <span class="inline-tag">THANKYOU30</span>
            to claim $30 in credits for a Pro plan. Credits will expire on 31 January 2024.
        </p>
    </div>
    <Box>
        <b class="body-text-1">Pro: $15 per member per billing period</b>

        <p class="u-margin-block-start-8">
            For pro developers and teams that need to scale their products. <a
                href="http://appwrite.io/pricing"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more on our pricing page.</a>
        </p>

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
                <span class="text">150GB free strorage</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">7 days rolling logs</span>
            </li>
            <li class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check-circle" aria-hidden="true" />
                <span class="text">Email support</span>
            </li>
        </ul>
        <Button
            fullWidth
            class="u-margin-block-start-24"
            on:click={() => wizard.start(ChangeOrganizationTierCloud)}
            on:click={() => show = false}
            on:click={() =>
                trackEvent('click_open_website', {
                    source: 'billing_release_modal',
                    destination: 'pricing'
                })}>
            Start your 14 day free trial
        </Button>
    </Box>
</ModalSideCol>
