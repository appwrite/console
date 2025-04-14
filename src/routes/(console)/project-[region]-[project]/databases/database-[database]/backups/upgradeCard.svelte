<script>
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';

    import EmptyDark from '$lib/images/backups/upgrade/backups-dark.png';
    import EmptyLight from '$lib/images/backups/upgrade/backups-light.png';

    import EmptyDarkMobile from '$lib/images/backups/upgrade/backups-mobile-dark.png';
    import EmptyLightMobile from '$lib/images/backups/upgrade/backups-mobile-light.png';

    import EmptyDarkTablet from '$lib/images/backups/upgrade/backups-tablet-dark.png';
    import EmptyLightTablet from '$lib/images/backups/upgrade/backups-tablet-light.png';

    import { upgradeURL } from '$lib/stores/billing';
    import { Card } from '$lib/components';
    import { isCloud } from '$lib/system';

    const title = isCloud
        ? 'Backups are available on paid plans'
        : 'Database Backups are available on Appwrite Cloud';

    const message = isCloud
        ? "Upgrade now to unlock Appwrite's backups."
        : "Sign up now to access Appwrite's backups.";
</script>

<div>
    <Card style="--card-padding: 1rem; --card-padding-mobile: 1rem">
        <div class="u-flex u-gap-24 u-flex-vertical-mobile u-cross-center">
            <div
                style:--p-file-preview-border-color="transparent"
                class="is-full-cover-image is-full-width-mobile u-height-100-percent">
                <div class="is-only-mobile u-width-full-line u-height-100-percent">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            height="137px"
                            src={EmptyDarkMobile}
                            class="placeholder u-image-object-fit-contain u-only-dark u-width-full-line u-height-100-percent"
                            alt="Mock Numbers Example" />
                    {:else}
                        <img
                            height="137px"
                            src={EmptyLightMobile}
                            class="placeholder u-image-object-fit-contain u-only-light u-width-full-line u-height-100-percent"
                            alt="Mock Numbers Example" />
                    {/if}
                </div>

                <div class="is-not-mobile">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmptyDark}
                            height="102px"
                            class="u-image-object-fit-contain u-block u-only-dark"
                            alt="Backups Example" />
                    {:else}
                        <img
                            src={EmptyLight}
                            height="102px"
                            class="u-image-object-fit-contain u-only-light"
                            alt="Backups Example" />
                    {/if}
                </div>

                <div class="is-tablet">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmptyDarkTablet}
                            height="102px"
                            class="u-image-object-fit-contain u-block u-only-dark"
                            alt="Backups Example" />
                    {:else}
                        <img
                            src={EmptyLightTablet}
                            height="102px"
                            class="u-image-object-fit-contain u-only-light"
                            alt="Backups Example" />
                    {/if}
                </div>
            </div>
            <div class="u-flex u-flex-vertical-mobile u-gap-mobile-6">
                <div class="u-flex-vertical u-gap-8">
                    <h3 class="body-text-2 u-bold">
                        {title}
                    </h3>

                    <span class="upgrade-description">
                        {message} Schedule automatic or manual backups to protect your data and ensure
                        quick recovery.
                    </span>
                </div>

                <Button
                    external={!isCloud}
                    class="is-not-mobile"
                    href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}>
                    {isCloud ? 'Upgrade plan' : 'Sign up'}
                </Button>

                <Button
                    fullWidthMobile
                    external={!isCloud}
                    class="is-only-mobile-button u-margin-block-start-32"
                    href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}>
                    {isCloud ? 'Upgrade plan' : 'Sign up'}
                </Button>
            </div>
        </div>
    </Card>
</div>

<style>
    .is-tablet {
        display: none;
    }

    :global(.is-only-mobile-button) {
        display: none;
    }

    @media (min-width: 768px) {
        .upgrade-description {
            padding-inline-end: 16ch;
        }
    }

    @media (max-width: 767.99px) {
        :global(.is-only-mobile-button) {
            display: flex;
        }
    }

    @media (min-width: 525px) and (max-width: 767.99px) {
        .is-tablet {
            display: block;
        }

        .is-tablet img {
            height: 100%;
        }

        .is-only-mobile {
            display: none !important;
        }
    }
</style>
