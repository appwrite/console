<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, EmptyCardImageCloud } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import { app } from '$lib/stores/app';
    import { upgradeURL } from '$lib/stores/billing';
    import EmailDark from './email-footer-dark.png';
    import EmailLight from './email-footer-light.png';
    import EmailMobileDark from './email-footer-mobile-dark.png';
    import EmailMobileLight from './email-footer-mobile-light.png';
</script>

<CardGrid>
    <svelte:fragment slot="title">Email signature</svelte:fragment>
    Enable or disable Appwrite branding in your email template signature.

    <svelte:fragment slot="aside">
        <EmptyCardImageCloud source="email_signature_card" let:nextTier>
            <svelte:fragment slot="image">
                <div class=" is-only-mobile u-width-full-line u-height-100-percent">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmailMobileDark}
                            class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            src={EmailMobileLight}
                            class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent"
                            alt="Email Signature Example" />
                    {/if}
                </div>
                <div class="is-not-mobile u-width-full-line u-height-100-percent">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmailDark}
                            width="266"
                            height="171"
                            class="u-image-object-fit-contain u-block u-only-dark u-width-full-line u-height-100-percent"
                            style:object-position="top"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            src={EmailLight}
                            width="266"
                            height="171"
                            class="u-image-object-fit-contain u-only-light u-width-full-line u-height-100-percent"
                            style:object-position="top"
                            alt="Email Signature Example" />
                    {/if}
                </div>
            </svelte:fragment>
            <svelte:fragment slot="title">Upgrade to edit email signature</svelte:fragment>
            Upgrade to a {nextTier} plan to enable or disable Appwrite branding in your emails.

            <svelte:fragment let:source slot="cta">
                <Button
                    class="u-margin-block-start-32"
                    secondary
                    fullWidth
                    href={$upgradeURL}
                    on:click={() => {
                        trackEvent(Click.OrganizationClickUpgrade, {
                            from: 'button',
                            source
                        });
                    }}>Upgrade plan</Button>
            </svelte:fragment>
        </EmptyCardImageCloud>
    </svelte:fragment>
</CardGrid>
