<script lang="ts">
    import { app } from '$lib/stores/app';
    import UpgradeCard from './upgradeCard.svelte';
    import ContainerHeader from './containerHeader.svelte';

    import LockedBackupsDarkDesktop from '$lib/images/backups/empty/backups-dark.png';
    import LockedBackupsLightDesktop from '$lib/images/backups/empty/backups-light.png';

    import LockedBackupsDarkMobile from '$lib/images/backups/empty/backups-mobile-dark.png';
    import LockedBackupsLightMobile from '$lib/images/backups/empty/backups-mobile-light.png';

    import LockedBackupsDarkTablet from '$lib/images/backups/empty/backups-tablet-dark.png';
    import LockedBackupsLightTablet from '$lib/images/backups/empty/backups-tablet-light.png';
</script>

<div class="u-flex-vertical u-gap-32">
    <UpgradeCard />

    <div>
        <!-- mobile, only policies are shown -->
        <div class="is-only-mobile u-flex-vertical u-gap-16">
            <ContainerHeader
                title="Policies"
                buttonText="Create policy"
                buttonType="secondary"
                buttonDisabled={true} />

            <img
                src={$app.themeInUse === 'dark'
                    ? LockedBackupsDarkMobile
                    : LockedBackupsLightMobile}
                alt="create"
                aria-hidden="true" />
        </div>

        <!-- tablet, only policies are shown but bigger table-->
        <div class="is-tablet u-flex-vertical u-gap-16 u-width-full-line">
            <ContainerHeader
                title="Policies"
                buttonText="Create policy"
                buttonType="secondary"
                buttonDisabled={true} />

            <img
                src={$app.themeInUse === 'dark'
                    ? LockedBackupsDarkTablet
                    : LockedBackupsLightTablet}
                alt="create"
                aria-hidden="true" />
        </div>

        <div class="is-desktop u-flex-vertical u-gap-16">
            <div class="desktop-locked-card-buttons u-flex u-gap-24">
                <div style="width: 31%">
                    <ContainerHeader
                        title="Policies"
                        buttonText="Create policy"
                        buttonType="secondary"
                        buttonDisabled={true} />
                </div>

                <div style="width: 69%; padding-inline-start: 1.5rem;">
                    <ContainerHeader
                        title="Backups"
                        buttonText="Manual backup"
                        buttonType="secondary"
                        buttonDisabled={true} />
                </div>
            </div>

            <img
                src={$app.themeInUse === 'dark'
                    ? LockedBackupsDarkDesktop
                    : LockedBackupsLightDesktop}
                alt="create"
                aria-hidden="true" />
        </div>
    </div>
</div>

<style>
    .is-tablet {
        display: none;
    }

    :global(.desktop-locked-card-buttons .common-section) {
        margin-block-start: unset !important;
    }

    @media (max-width: 524px) {
        .is-tablet,
        .is-desktop {
            height: 0;
            visibility: hidden;
            display: none !important;
        }
    }

    @media (min-width: 525px) and (max-width: 799.99px) {
        .is-tablet {
            display: block;
        }

        .is-desktop,
        .is-only-mobile {
            height: 0;
            visibility: hidden;
            display: none !important;
        }
    }

    @media (min-width: 800px) {
        .is-desktop {
            display: block !important;
        }

        .is-tablet,
        .is-only-mobile {
            height: 0;
            visibility: hidden;
            display: none !important;
        }
    }
</style>
