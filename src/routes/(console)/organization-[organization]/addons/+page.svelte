<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { upgradeURL } from '$lib/stores/billing';
    import { feedback } from '$lib/stores/feedback';
    import { organization } from '$lib/stores/organization';
    import GeoDBAddon from './geodb-addon.png';

    function activateAddon() {
        // Add your logic here
    }
</script>

<Container>
    <CardGrid>
        <span class="u-flex u-gap-8 u-cross-center">
            <Heading tag="h2" size="6">Premium Geo Database</Heading>
            <Pill>Included in Scale</Pill>
        </span>

        <svelte:fragment slot="aside">
            <div class="u-flex u-gap-24 u-flex-vertical-mobile">
                <div class="u-stretch">
                    <div
                        style:--p-file-preview-border-color="transparent"
                        class="file-preview is-full-cover-image u-width-full-line u-height-100-percent"
                        style="aspect-ratio: auto">
                        <img
                            src={GeoDBAddon}
                            class="u-image-object-fit-cover u-width-full-line u-height-100-percent"
                            alt="Email Signature Example" />
                    </div>
                </div>
                <div class="u-stretch u-flex-vertical u-main-start">
                    <p class="u-margin-block-start-8">
                        Unlock enhanced geo data with our premium Geo Database, included in the
                        Scale plan. Get more accurate location details about your user's sessions
                        from the API, including city and ISP information.
                    </p>
                    <Button link external href="#/">Learn more</Button>
                </div>
            </div>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if $organization.billingPlan === BillingPlan.FREE}
                <Button secondary href={$upgradeURL}>Upgrade</Button>
            {:else if $organization.billingPlan === BillingPlan.PRO}
                <Button text href={$upgradeURL}>Upgrade to Scale</Button>
                <Button secondary on:click={activateAddon}>Enable addon</Button>
            {:else}
                <Button secondary on:click={() => feedback.toggleFeedback()}>Leave feedback</Button>
            {/if}
        </svelte:fragment>
    </CardGrid>
</Container>
