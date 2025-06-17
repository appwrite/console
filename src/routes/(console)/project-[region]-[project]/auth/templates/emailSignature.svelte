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
                            class="u-image-object-fit-cover u-only-dark u-width-full-line"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            src={EmailMobileLight}
                            class="u-image-object-fit-cover u-only-light u-width-full-line"
                            alt="Email Signature Example" />
                    {/if}
                </div>
                <div class="is-not-mobile u-width-full-line u-height-100-percent">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            width="266"
                            src={EmailDark}
                            style:object-position="top"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            width="266"
                            src={EmailLight}
                            style:object-position="top"
                            alt="Email Signature Example" />
                    {/if}
                </div>
            </svelte:fragment>
            <svelte:fragment slot="title">Upgrade to remove Appwrite branding</svelte:fragment>
            Upgrade to a {nextTier} plan to remove the Appwrite branding from your emails.

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
