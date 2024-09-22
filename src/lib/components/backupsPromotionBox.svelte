<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { app } from '$lib/stores/app';

    import { isCloud } from '$lib/system';
    import { upgradeURL } from '$lib/stores/billing';
    import { Button } from '$lib/elements/forms/index';
    import { userHidBackupsPromotion } from '$lib/stores/database';

    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';

    import EmptyDark from '$lib/images/backups/backups-empty-dark.svg';
    import EmptyLight from '$lib/images/backups/backups-empty-light.svg';

    const isFreePlan = isCloud && $organization.billingPlan === BillingPlan.FREE;

    const title = isFreePlan
        ? 'Backups are available on Pro plan'
        : 'Database backups are now available';

    const message = isFreePlan
        ? 'Schedule automatic or manual backups to protect your data and ensure quick recovery.'
        : isCloud
          ? 'Protect your data and ensure quick recovery with our new backups.<br/><b>Try it now for free until Nov 2024.</b>'
          : 'Protect your data and ensure quick recovery with Appwrite backups. Sign up now.';

    const ctaText = isFreePlan ? 'Upgrade plan' : isCloud ? 'Try now' : 'Sign up';

    const ctaLink = isFreePlan
        ? $upgradeURL
        : isCloud
          ? // TODO: @itznotabug, confirm if we should navigate to databases
            `${base}/project-${$page.params.project}/databases`
          : 'https://cloud.appwrite.io/register';

    // we already show banners on `/databases/databases-databaseID` and `/databases/databases-databaseID/backups`.
    $: shouldShow =
        !$userHidBackupsPromotion &&
        !$page.url.pathname.match(/\/databases\/database-[^/]+(\/backups)?$/);

    function handleClose() {
        $userHidBackupsPromotion = true;
    }
</script>

{#if shouldShow}
    <article class="is-not-mobile card promotional-card u-width-fit-content">
        <div class="u-flex-vertical u-gap-16" style="padding-block: 0.5rem;">
            <div class="showcase-images">
                <button class="inline-tag" on:click={handleClose}>
                    <span class="icon-x" />
                </button>

                {#if $app.themeInUse === 'dark'}
                    <img
                        src={EmptyDark}
                        class="showcase-image u-image-object-fit-contain u-block u-only-dark"
                        alt="Backups Example" />
                {:else}
                    <img
                        src={EmptyLight}
                        class="showcase-image u-image-object-fit-contain u-only-light"
                        alt="Backups Example" />
                {/if}
            </div>

            <div class="u-flex-vertical u-gap-8 u-padding-inline-8">
                <h3 class="body-text-2 u-bold">{title}</h3>

                <span class="u-width-fit-content">
                    {@html message}
                </span>
            </div>

            <div class="buttons u-flex u-gap-4 u-padding-inline-8 u-padding-block-8">
                <Button
                    secondary
                    class="button"
                    href={ctaLink}
                    external={!isCloud}
                    on:click={handleClose}>
                    {ctaText}
                </Button>

                <Button text class="button" external={!isCloud} href="https://appwrite.io/docs/">
                    <!-- TODO: @itznotabug need correct link for learn more -->
                    Learn More
                </Button>
            </div>
        </div>
    </article>
{/if}

<style>
    .card {
        padding: 0.5rem !important;
    }

    .promotional-card {
        left: 1rem;
        z-index: 25;
        bottom: 1rem; /* use 5rem to keep settings menu visible */
        max-width: 300px;
        position: fixed;
    }

    .showcase-image {
        padding-inline: 1rem;
        padding-block: 0.5rem;
    }

    .showcase-images {
        border-radius: 8px;
        padding-inline: 0.5rem;
        backdrop-filter: blur(23.84245491027832px);
        border: 0.795px solid transparent;
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 100%)
                padding-box,
            linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(200, 200, 200, 0.1)) border-box;
        background-clip: padding-box, border-box;
    }

    :global(.theme-dark) .showcase-images {
        background:
            linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%) padding-box,
            linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(150, 150, 150, 0.1)) border-box;
    }

    .inline-tag {
        top: 0;
        right: 0;
        position: absolute;
        background: unset !important;
        border-radius: var(--border-radius-S, 8px);
        border: hsl(var(--p-inline-tag-bg-color-default)) solid 1px;
    }

    .icon-x {
        font-size: 1.25rem;
    }

    :global(.promotional-card .button) {
        border-radius: 0.75rem !important;
    }
</style>
