<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import { isSupportOnline, showSupportModal } from '$routes/(console)/wizard/support/store';
    import { trackEvent } from '$lib/actions/analytics';
    import { localeShortTimezoneName, utcHourToLocaleHour } from '$lib/helpers/date';
    import { plansInfo } from '$lib/stores/billing';
    import { Card } from '$lib/components/index';
    import { app } from '$lib/stores/app';
    import { currentPlan, type Organization, organizationList } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { base } from '$app/paths';

    export let show = false;

    export let showHeader = true;

    $: hasPremiumSupport = $currentPlan?.premiumSupport ?? allOrgsHavePremiumSupport ?? false;

    $: allOrgsHavePremiumSupport = $organizationList.teams.every(
        (team) => $plansInfo.get((team as Organization).billingPlan)?.premiumSupport
    );

    // there can only be one free organization
    $: freeOrganization = $organizationList.teams.find(
        (team) => !$plansInfo.get((team as Organization).billingPlan)?.premiumSupport
    );

    $: upgradeURL = `${base}/organization-${freeOrganization?.$id}/change-plan`;

    $: supportTimings = `${utcHourToLocaleHour('16:00')} - ${utcHourToLocaleHour('00:00')} ${localeShortTimezoneName()}`;

    type SupportOption = {
        cta?: string;
        icon: string;
        label: string;
        link?: string;
        description: string;
        showSupport: boolean;
    };

    const supportOptions: SupportOption[] = [
        {
            showSupport: true,
            icon: 'support',
            label: 'Premium support',
            description: 'Get priority email support from the Appwrite team'
        },

        {
            icon: 'discord',
            cta: 'Discord',
            showSupport: false,
            label: 'Community support',
            link: 'https://appwrite.io/discord',
            description: 'Get support from our community through Discord'
        },
        {
            icon: 'github',
            cta: 'Open issue',
            showSupport: false,
            label: 'Open GitHub issue',
            link: 'https://github.com/appwrite/appwrite/issues/new/choose',
            description: 'Report a bug or pitch a new feature'
        }
    ];

    const showCloudSupport = (index: number) => {
        return (index === 0 && isCloud) || index > 0;
    };
</script>

<section class="drop-section support-section">
    {#if showHeader}
        <h4 class="heading-level-6">Support</h4>
    {/if}

    {#each supportOptions as option, index}
        {#if showCloudSupport(index)}
            <Card
                isTile
                class="support-option-card u-flex u-flex-vertical u-gap-16"
                style="border-radius: var(--border-radius-small, 8px); padding: 0.65rem;">
                <div class="u-flex u-flex-vertical u-gap-4">
                    <h4 class="body-text-2 u-bold">{option.label}</h4>

                    <p class="u-line-height-1-5">
                        {option.description}
                    </p>
                </div>

                {#if option.showSupport}
                    <div class="u-flex u-gap-12 u-cross-center">
                        {#if !hasPremiumSupport}
                            <Button
                                href={upgradeURL}
                                on:click={() => {
                                    trackEvent('click_organization_upgrade', {
                                        from: 'button',
                                        source: 'support_menu'
                                    });
                                }}>
                                <span class="text">Get Premium support</span>
                            </Button>
                        {:else}
                            <Button
                                secondary
                                class="secondary-button"
                                on:click={() => {
                                    show = false;
                                    $showSupportModal = false;
                                    wizard.start(SupportWizard);
                                }}>
                                <span class="text">Contact support</span>
                            </Button>
                        {/if}

                        <div class="u-flex u-gap-6 u-cross-center">
                            <span
                                aria-hidden="true"
                                class="{isSupportOnline()
                                    ? 'icon-check-circle u-color-text-success'
                                    : 'icon-x-circle'} u-padding-block-end-1" />

                            {supportTimings}
                        </div>
                    </div>
                {:else}
                    <Button
                        href={option.link}
                        external
                        secondary
                        class="secondary-button u-flex u-cross-center u-gap-6"
                        on:click={() => {
                            trackEvent('click_organization_upgrade', {
                                from: 'button',
                                source: 'support_menu'
                            });
                        }}>
                        <span class={`icon-${option.icon}`} />
                        <span>{option.cta}</span>
                    </Button>
                {/if}
            </Card>
        {/if}
    {/each}

    {#if isCloud}
        <div class="u-width-full-line">
            {#key $app.themeInUse}
                <iframe
                    style="color-scheme: none"
                    title="Appwrite Status"
                    src={`https://status.appwrite.online/badge?theme=${
                        $app.themeInUse === 'dark' ? 'dark' : 'light'
                    }`}
                    width="250"
                    height="30"
                    frameborder="0"
                    scrolling="no">
                </iframe>
            {/key}
        </div>
    {/if}
</section>

<style lang="scss">
    .support-section {
        gap: 1rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;

        @media (max-width: 768px) {
            gap: 1.25rem;
            padding: 0.5rem;
        }
    }

    :global(.u-gap-6) {
        gap: 0.375rem;
    }

    :global(.support-option-card) {
        padding: 0.75rem !important;
    }

    :global(.theme-dark .support-option-card) {
        background: var(--color-bgColor-neutral-default, #19191c);
    }

    :global(.theme-dark .support-option-card .secondary-button) {
        background: var(--color-bgColor-neutral-primary, #131315);
    }

    :global(.theme-light .support-option-card) {
        border: 1px solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgColor-neutral-default, #fafafb);
    }

    :global(.theme-light .support-option-card .secondary-button) {
        background: var(--color-bgColor-neutral-primary, #fff);
    }
</style>
