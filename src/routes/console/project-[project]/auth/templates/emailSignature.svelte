<script lang="ts">
    import { CardGrid, EmptyCardImageCloud, Heading } from '$lib/components';
    import { app } from '$lib/stores/app';
    import EmailDark from './email-footer-dark.png';
    import EmailLight from './email-footer-light.png';
    import EmailMobileDark from './email-footer-mobile-dark.png';
    import EmailMobileLight from './email-footer-mobile-light.png';
</script>

<CardGrid>
    <Heading size="7" tag="h3">Email signature</Heading>
    <p class="text">Enable or disable Appwrite branding in your email template signature.</p>

    <svelte:fragment slot="aside">
        <EmptyCardImageCloud source="email_signature_card" let:nextTier>
            <svelte:fragment slot="image">
                <div class="is-only-mobile">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmailMobileDark}
                            width="266"
                            height="171"
                            class="u-image-object-fit-cover u-only-dark"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            src={EmailMobileLight}
                            width="266"
                            height="171"
                            class="u-image-object-fit-cover u-only-light"
                            alt="Email Signature Example" />
                    {/if}
                </div>
                <div class="is-not-mobile">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmailDark}
                            width="266"
                            height="171"
                            class="u-image-object-fit-cover u-block u-only-dark"
                            alt="Email Signature Example" />
                    {:else}
                        <img
                            src={EmailLight}
                            width="266"
                            height="171"
                            class="u-image-object-fit-cover u-only-light"
                            alt="Email Signature Example" />
                    {/if}
                </div>
            </svelte:fragment>
            <svelte:fragment slot="title">Upgrade to edit email signature</svelte:fragment>
            Upgrade to a {nextTier} plan to enable or disable Appwrite branding in your emails.
        </EmptyCardImageCloud>
    </svelte:fragment>
</CardGrid>
