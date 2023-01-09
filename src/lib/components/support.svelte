<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import SupportLight from '$lib/images/support/support-light.png';
    import SupportDark from '$lib/images/support/support-dark.png';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '../../routes/console/supportWizard.svelte';
    import { Mode, Tier } from '$lib/constants';
    const mode = import.meta.env.VITE_CONSOLE_MODE?.toString() || Mode.SELF_HOSTED;
    const tier = import.meta.env.VITE_CONSOLE_TIER?.toString() || Tier.BASE;

    export let show = false;
</script>

{#if mode === 'cloud'}
    <section class="drop-section u-grid u-gap-24 u-padding-24">
        <div class="u-flex">
            {#if $app.themeInUse === 'light'}
                <img src={SupportLight} alt="Support" />
            {:else}
                <img src={SupportDark} alt="Support" />
            {/if}
        </div>
        <div>
            <h4 class="eyebrow-heading-3">Premium support</h4>
            <p class="u-line-height-1-5 u-margin-block-start-8">
                Get personalized support from the Appwrite team from <b>09:00 - 17:00 UTC</b>
            </p>
        </div>
        {#if tier === 'base'}
            <Button fullWidth href="https://appwrite.io/billing">
                <span class="text">Get Premium support</span>
            </Button>
        {:else}
            <Button
                secondary
                fullWidth
                on:click={() => {
                    show = false;
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
        <!-- TODO: check service live -->
        <a
            href="https://status.appwrite.io/"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-text u-gap-4 u-cross-center u-padding-inline-0 u-margin-block-start-8 u-width-full-line">
            <span class="helper u-success">
                <span class="icon-check-circle" aria-hidden="true" />
            </span>
            <b class="text">All services are online</b>
        </a>
    </div>
    <div class="u-flex u-gap-16 u-margin-block-start-8">
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
        <h4 class="eyebrow-heading-3">community support</h4>
        <p>Get help from our community</p>
    </div>
    <ul class="u-flex">
        <li>
            <Button
                href="https://github.com/appwrite"
                round
                text
                noMargin
                external
                ariaLabel="Github">
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
