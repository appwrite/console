<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import { isSupportOnline, showSupportModal } from '$routes/(console)/wizard/support/store';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { localeShortTimezoneName, utcHourToLocaleHour } from '$lib/helpers/date';
    import { upgradeURL } from '$lib/stores/billing';
    import { Card } from '$lib/components/index';
    import { app } from '$lib/stores/app';

    export let show = false;

    $: isPaid =
        $organization?.billingPlan === BillingPlan.PRO ||
        $organization?.billingPlan === BillingPlan.SCALE;

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
            link: 'https://github.com/appwrite',
            description: 'Report a bug or pitch a new feature'
        }
    ];
</script>

<section class="drop-section support-section">
    <h4 class="heading-level-6">Support</h4>

    {#each supportOptions as option}
        <Card
            isTile
            class="support-option-card u-flex u-flex-vertical u-gap-12"
            style="border-radius: var(--border-radius-small, 8px); padding: 0.65rem;">
            <div class="u-flex u-flex-vertical u-gap-4">
                <h4 class="body-text-2 u-bold">{option.label}</h4>

                <p class="u-line-height-1-5 u-margin-block-start-8">
                    {option.description}
                </p>
            </div>

            {#if option.showSupport}
                <div class="u-flex u-gap-12 u-cross-center">
                    {#if !isPaid}
                        <Button
                            href={$upgradeURL}
                            on:click={() => {
                                trackEvent('click_organization_upgrade', {
                                    from: 'button',
                                    source: 'support_menu'
                                });
                            }}
                            ><span class="text">Get Premium support</span>
                        </Button>
                    {:else}
                        <Button
                            secondary
                            on:click={() => {
                                show = false;
                                $showSupportModal = false;
                                wizard.start(SupportWizard);
                            }}>
                            <span class="text">Contact support</span>
                        </Button>
                    {/if}

                    <div class="u-flex u-gap-4 u-cross-center">
                        {#if isSupportOnline()}
                            <span
                                class="icon-check-circle u-color-text-success"
                                aria-hidden="true" />
                        {/if}

                        {supportTimings}
                    </div>
                </div>
            {:else}
                <Button
                    href={option.link}
                    external
                    secondary
                    class="u-flex u-cross-center u-gap-6"
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
    {/each}

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
</section>

<style lang="scss">
    .support-section {
        gap: 1rem;
        padding: 20px;
        display: flex;
        flex-direction: column;

        @media (max-width: 768px) {
            gap: 1.25rem;
            padding: 0.5rem;
        }
    }

    :global(.theme-light .support-option-card) {
        border: 1px solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgColor-neutral-default, #fafafb);
    }
</style>
