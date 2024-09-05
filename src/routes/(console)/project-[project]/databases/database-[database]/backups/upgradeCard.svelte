<script>
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';

    import EmptyDark from '$lib/images/backups-empty-dark.svg';
    import EmptyLight from '$lib/images/backups-empty-light.svg';
    import { upgradeURL } from '$lib/stores/billing';
    import { Card } from '$lib/components';
    import { isCloud } from '$lib/system';
</script>

<div>
    <Card style="--card-padding: 1rem; --card-padding-mobile: 2rem">
        <div class="u-flex u-gap-24 u-flex-vertical-mobile u-cross-center">
            <div
                style:--p-file-preview-border-color="transparent"
                class="file-preview is-full-cover-image is-full-width-mobile u-height-100-percent">
                <div class="is-only-mobile u-width-full-line u-height-100-percent">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmptyDark}
                            class="u-only-dark u-width-full-line u-height-100-percent"
                            alt="Mock Numbers Example" />
                    {:else}
                        <img
                            src={EmptyLight}
                            class="u-only-light u-width-full-line u-height-100-percent"
                            alt="Mock Numbers Example" />
                    {/if}
                </div>

                <div class="is-not-mobile">
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={EmptyDark}
                            class="u-image-object-fit-contain u-block u-only-dark"
                            alt="Backups Example" />
                    {:else}
                        <img
                            src={EmptyLight}
                            class="u-image-object-fit-contain u-only-light"
                            alt="Backups Example" />
                    {/if}
                </div>
            </div>
            <div class="u-flex u-flex-vertical-mobile u-gap-mobile-6">
                <div class="u-flex-vertical u-gap-8">
                    <h3 class="body-text-2 u-bold">
                        Backups are available for free on Pro plan until Nov 2024
                    </h3>

                    <span class="u-padding-inline-end-32">
                        Upgrade now to unlock Appwrite's backups. Schedule automatic or manual
                        backups to protect your data and ensure quick recovery.
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
                    class="is-only-mobile u-margin-block-start-32"
                    href={isCloud ? $upgradeURL : 'https://cloud.appwrite.io/register'}>
                    {isCloud ? 'Upgrade plan' : 'Sign up'}
                </Button>
            </div>
        </div>
    </Card>
</div>
