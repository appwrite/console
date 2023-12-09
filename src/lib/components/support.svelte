<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import SupportOfflineLight from '$lib/images/support/support-offline-light.png';
    import SupportOfflineDark from '$lib/images/support/support-offline-dark.png';
    import SupportOnlineLight from '$lib/images/support/support-online-light.png';
    import SupportOnlineDark from '$lib/images/support/support-online-dark.png';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '../../routes/console/supportWizard.svelte';
    import { isSupportOnline, showSupportModal } from '../../routes/console/wizard/support/store';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';

    export let show = false;

    $: isPaid = $organization?.billingPlan === 'tier-1' || $organization?.billingPlan === 'tier-2';
</script>

{#if isCloud}
    <section class="drop-section u-grid u-gap-24 u-padding-24">
        <div class="u-flex u-main-center">
            {#if isSupportOnline()}
                {#if $app.themeInUse === 'light'}
                    <img src={SupportOnlineLight} alt="Support" height="87" width="230" />
                {:else}
                    <img src={SupportOnlineDark} alt="Support" height="87" width="230" />
                {/if}
            {:else if $app.themeInUse === 'light'}
                <img src={SupportOfflineLight} alt="Support" height="87" width="230" />
            {:else}
                <img src={SupportOfflineDark} alt="Support" height="87" width="230" />
            {/if}
        </div>
        <div>
            <h4 class="eyebrow-heading-3">Premium support</h4>
            {#if isPaid}
                <p class="u-line-height-1-5 u-margin-block-start-8">
                    Get personalized support from the Appwrite team from <b>09:00 - 17:00 UTC</b>
                </p>
            {/if}
        </div>
        {#if $organization?.billingPlan === 'tier-0'}
            <Button fullWidth href="https://appwrite.io/pricing" external>
                <span class="text">Get Premium support</span>
            </Button>
        {:else}
            <Button
                secondary
                fullWidth
                on:click={() => {
                    show = false;
                    $showSupportModal = false;
                    wizard.start(SupportWizard);
                }}>
                <span class="text">Contact our Support Team</span>
            </Button>
        {/if}
    </section>
{/if}
<section class="drop-section u-grid u-gap-24 u-padding-24">
    <div>
        <h4 class="eyebrow-heading-3">Troubleshooting</h4>

        <div class="u-margin-block-start-8 u-width-full-line">
            <iframe
                title="Appwrite Status"
                src="https://status.appwrite.online/badge?theme=dark"
                width="250"
                height="30"
                frameborder="0"
                scrolling="no"></iframe>
        </div>
    </div>

    <div class="u-flex u-gap-16">
        <a
            href="https://appwrite.io/docs"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-secondary u-padding-inline-12 u-stretch u-main-center u-gap-4 u-flex-basis-auto">
            <span class="icon-book-open" aria-hidden="true" />
            <span class="text">Docs</span>
        </a>
        <a
            href="https://github.com/appwrite/appwrite/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-secondary u-padding-inline-12 u-stretch u-main-center u-gap-4 u-flex-basis-auto">
            <span class="icon-github" aria-hidden="true" />
            <span class="text">Open issue</span>
        </a>
    </div>
</section>
<section class="drop-section u-grid u-gap-8 u-padding-24">
    <div>
        <h4 class="eyebrow-heading-3">Community support</h4>
        <p class="text u-margin-block-start-8">Get help from our community</p>
    </div>
    <ul class="u-flex u-gap-8">
        <li>
            <Button href="https://github.com/appwrite" text noMargin external ariaLabel="Github">
                <span class="icon-github" aria-hidden="true" />
            </Button>
        </li>
        <li>
            <Button
                href="https://appwrite.io/discord"
                round
                text
                noMargin
                external
                ariaLabel="Discord">
                <span class="icon-discord" aria-hidden="true" />
            </Button>
        </li>
    </ul>
</section>
