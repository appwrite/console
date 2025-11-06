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
    import { isCloud } from '$lib/system';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    const title = isCloud
        ? 'Backups are available on paid plans'
        : `Database Backups are available on ${resolvedProfile.platform} Cloud`;

    const message = isCloud
        ? `Upgrade now to unlock ${resolvedProfile.platform}'s backups.`
        : `Sign up now to access ${resolvedProfile.platform}'s backups.`;

    const isDark = $app.themeInUse === 'dark';

    const themeClass = isDark ? 'u-only-dark' : 'u-only-light';
    const mobileImg = isDark ? EmptyDarkMobile : EmptyLightMobile;
    const desktopImg = isDark ? EmptyDark : EmptyLight;
    const tabletImg = isDark ? EmptyDarkTablet : EmptyLightTablet;
</script>

<div>
    <Card.Base padding="xs">
        <div class="u-flex u-gap-24 u-flex-vertical-mobile u-cross-center">
            <div
                style:--p-file-preview-border-color="transparent"
                class="is-full-cover-image is-full-width-mobile u-height-100-percent">
                <!-- mobile -->
                <div
                    style:min-height="172px"
                    class="is-only-mobile u-width-full-line u-height-100-percent">
                    <img
                        src={mobileImg}
                        style:width="100vw"
                        class="placeholder u-image-object-fit-contain {themeClass}"
                        alt="Mock Numbers Example" />
                </div>
                <!-- tablet -->
                <div style:min-height="140px" class="is-tablet">
                    <img
                        src={tabletImg}
                        style:width="100vw"
                        class="u-image-object-fit-contain {themeClass}"
                        alt="Backups Example" />
                </div>
                <!-- desktop -->
                <div class="is-not-mobile">
                    <img
                        height="102"
                        width="178"
                        src={desktopImg}
                        class="u-image-object-fit-contain {themeClass}"
                        alt="Backups Example" />
                </div>
            </div>
            <Layout.Stack direction="row" alignItems="center" wrap="wrap">
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-600">{title}</Typography.Text>
                    <span class="upgrade-description">
                        {message} Schedule automatic or manual backups to protect your data and ensure
                        quick recovery.
                    </span>
                </Layout.Stack>

                <span class="is-only-mobile-button">
                    <Button
                        external={!isCloud}
                        href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}>
                        {isCloud ? 'Upgrade plan' : 'Sign up'}
                    </Button>
                </span>
            </Layout.Stack>
            <div class="is-not-mobile">
                <Button
                    external={!isCloud}
                    href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}>
                    {isCloud ? 'Upgrade plan' : 'Sign up'}
                </Button>
            </div>
        </div>
    </Card.Base>
</div>

<style>
    .is-tablet {
        display: none;
    }

    :global(.is-only-mobile-button) {
        display: none;
    }

    @media (min-width: 1260px) {
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
