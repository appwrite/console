<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import SupportLight from '$lib/images/support/support-light.png';
    import SupportDark from '$lib/images/support/support-dark.png';
    import { app } from '$lib/stores/app';

    export let show = false;
</script>

<section class="drop-section u-overflow-y-auto">
    <div class="common-section">
        {#if $app.themeInUse === 'light'}
            <img src={SupportLight} alt="Support" />
        {:else}
            <img src={SupportDark} alt="Support" />
        {/if}
        <h5 class="eyebrow-heading-3">Premium support</h5>
        <p class="text">Get personalized support from the Appwrite team</p>
        <Button href="https://appwrite.io" external>Get premium support</Button>
    </div>
    <div class="common-section">
        <h5 class="eyebrow-heading-3">troubleshooting</h5>
        <div class="u-flex u-gap-16">
            <Button secondary href="https://appwrite.io/docs">
                <span class="icon-book-open" aria-hidden="true" />
                <span class="text">Docs</span>
            </Button>
            <Button secondary href="https://appwrite.io/docs">
                <span class="icon-github" aria-hidden="true" />
                <span class="text">Open issue</span>
            </Button>
        </div>
    </div>
    <div class="common-section">
        <h5 class="eyebrow-heading-3">Community support</h5>
        <p class="text">Get help from our community</p>
        <div class="u-flex u-gap-16">
            <Button
                href="https://github.com/appwrite"
                round
                text
                noMargin
                external
                ariaLabel="Github">
                <span class="icon-github" aria-hidden="true" />
            </Button>
            <Button
                href="https://appwrite.io/discord"
                round
                text
                noMargin
                external
                ariaLabel="Discord">
                <span class="icon-discord" aria-hidden="true" />
            </Button>
        </div>
    </div>
</section>
