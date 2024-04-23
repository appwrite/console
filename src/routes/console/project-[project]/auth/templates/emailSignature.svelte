<script lang="ts">
    import { CardGrid, EmptyCardAsideCloud, Heading } from '$lib/components';
    import { app } from '$lib/stores/app';
    import EmailDark from './email-footer-dark.svg';
    import EmailLight from './email-footer-light.svg';
    import EmailMobileDark from './email-footer-mobile-dark.svg';
    import EmailMobileLight from './email-footer-mobile-light.svg';
</script>

<CardGrid>
    <Heading size="7" tag="h3">Email signature</Heading>
    <p class="text">Enable or disable Appwrite branding in your email template signature.</p>

    <svelte:fragment slot="aside">
        <EmptyCardAsideCloud source="email_signature_card" let:nextTier>
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
        </EmptyCardAsideCloud>
    </svelte:fragment>
</CardGrid>
