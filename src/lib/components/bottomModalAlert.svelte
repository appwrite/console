<script lang="ts">
    import { Button } from '$lib/elements/forms/index';
    import { hideNotification, shouldShowNotification } from '$lib/helpers/notifications';
    import { app } from '$lib/stores/app';
    import {
        type BottomModalAlertItem,
        bottomModalAlertsConfig,
        dismissBottomModalAlert,
        hideAllModalAlerts
    } from '$lib/stores/bottom-alerts';
    import { onMount } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import { upgradeURL } from '$lib/stores/billing';
    import { addBottomModalAlerts } from '$routes/(console)/bottomAlerts';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { goto } from '$app/navigation';

    let currentIndex = 0;
    let openModalOnMobile = false;

    function getPageScope(pathname: string) {
        const isProjectPage = pathname.includes('project-[project]');
        const isOrganizationPage = pathname.includes('organization-[organization]');

        return { isProjectPage, isOrganizationPage };
    }

    function filterModalAlerts(alerts: BottomModalAlertItem[], pathname: string) {
        const { isProjectPage, isOrganizationPage } = getPageScope(pathname);

        return alerts
            .sort((a, b) => b.importance - a.importance)
            .filter((alert) => {
                if (!alert.show || !shouldShowNotification(alert.id)) return false;

                switch (alert.scope) {
                    case 'everywhere':
                        return true;
                    case 'project':
                        return isProjectPage;
                    case 'organization':
                        return isOrganizationPage;
                    default:
                        return false;
                }
            });
    }

    $: filteredModalAlerts = filterModalAlerts($bottomModalAlertsConfig.alerts, $page.route.id);

    $: currentModalAlert = filteredModalAlerts[currentIndex] as BottomModalAlertItem;

    $: hasOnlyPrimaryCta = typeof currentModalAlert?.learnMore === 'undefined';

    function handleClose() {
        filteredModalAlerts.forEach((alert) => {
            const modalAlert = alert;
            dismissBottomModalAlert(modalAlert.id);
            hideNotification(modalAlert.id, { coolOffPeriod: 24 * 365 });
            if (modalAlert.closed) modalAlert.closed();
        });
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % filteredModalAlerts.length;
    }

    function showPrevious() {
        currentIndex = (currentIndex - 1 + filteredModalAlerts.length) % filteredModalAlerts.length;
    }

    function getMobileWindowConfig(): {
        html: boolean;
        cta: boolean;
        title: string;
        message: string;
    } {
        const config = $bottomModalAlertsConfig?.mobileSingleLayout;
        const visibleAlerts = $bottomModalAlertsConfig.alerts.filter((a) => a.show);

        const fallback = {
            title: 'New features available',
            message: 'Explore new features to enhance your projects and improve security.'
        };

        const shouldApplyConfig = config?.enabled === true && visibleAlerts.length === 1;

        return {
            cta: !!(shouldApplyConfig && config.cta),
            html: !!(shouldApplyConfig && config.isHtml),
            title: shouldApplyConfig && config.title ? config.title : fallback.title,
            message: shouldApplyConfig && config.message ? config.message : fallback.message
        };
    }

    function triggerMobileWindowLink() {
        handleClose();

        const url = $bottomModalAlertsConfig.mobileSingleLayout.cta.link({
            organization: $organization,
            project: $project
        });

        if ($bottomModalAlertsConfig.mobileSingleLayout.cta.external) {
            window.open(url, '_blank');
        } else {
            goto(url);
        }
    }

    function showUpgrade() {
        const plan = currentModalAlert.plan;
        const organizationPlan = $organization.billingPlan;
        switch (plan) {
            case 'free':
                return false;
            case 'pro':
                return organizationPlan === BillingPlan.FREE;
            case 'scale':
                return (
                    organizationPlan === BillingPlan.FREE || organizationPlan === BillingPlan.PRO
                );
        }
    }

    onMount(() => {
        addBottomModalAlerts();
    });
</script>

{#if filteredModalAlerts.length > 0 && currentModalAlert}
    {@const shouldShowUpgrade = showUpgrade()}
    <div class="main-alert-wrapper is-not-mobile">
        <div class="alert-container">
            <article class="card">
                {#key currentModalAlert.id}
                    <button class="icon-inline-tag" on:click={() => handleClose()}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"
                                fill="#97979B" />
                        </svg>
                    </button>

                    <div class="content-wrapper u-flex-vertical u-gap-16">
                        {#if $app.themeInUse === 'dark'}
                            <img
                                src={currentModalAlert.src.dark}
                                alt={currentModalAlert.title}
                                class="showcase-image u-image-object-fit-contain u-block u-only-dark" />
                        {:else}
                            <img
                                src={currentModalAlert.src.light}
                                alt={currentModalAlert.title}
                                class="showcase-image u-image-object-fit-contain u-block u-only-light" />
                        {/if}

                        {#if filteredModalAlerts.length > 1}
                            <div class="u-flex u-main-space-between u-cross-baseline">
                                <span class="inline-tag feature-count-tag">
                                    Feature {currentIndex + 1} of {filteredModalAlerts.length}
                                </span>

                                <div class="u-flex u-gap-10">
                                    <button
                                        class="icon-cheveron-left"
                                        on:click={showPrevious}
                                        disabled={currentIndex === 0}
                                        class:active={currentIndex > 0} />

                                    <button
                                        class="icon-cheveron-right"
                                        on:click={showNext}
                                        disabled={currentIndex === filteredModalAlerts.length - 1}
                                        class:active={currentIndex !==
                                            filteredModalAlerts.length - 1} />
                                </div>
                            </div>
                        {/if}

                        <div class="u-flex-vertical u-gap-4 u-padding-inline-8">
                            <h3 class="body-text-2 u-bold">{currentModalAlert.title}</h3>

                            <span class="u-width-fit-content">
                                {#if currentModalAlert.isHtml}
                                    {@html currentModalAlert.message}
                                {:else}
                                    {currentModalAlert.message}
                                {/if}
                            </span>
                        </div>

                        <div
                            class="buttons u-flex u-flex-vertical-mobile u-gap-4 u-padding-inline-8 u-padding-block-8">
                            <Button
                                secondary={!hasOnlyPrimaryCta}
                                class={`${hasOnlyPrimaryCta ? 'only-primary-cta' : ''}`}
                                href={shouldShowUpgrade
                                    ? $upgradeURL
                                    : currentModalAlert.cta.link({
                                          organization: $organization,
                                          project: $project
                                      })}
                                external={!!currentModalAlert.cta.external}
                                fullWidthMobile
                                on:click={() => {
                                    if (currentModalAlert.cta?.hideOnClick === true) {
                                        // be careful of this one.
                                        // once clicked, its gone!
                                        handleClose();
                                    }

                                    trackEvent('click_promo', {
                                        promo: currentModalAlert.id,
                                        type: shouldShowUpgrade ? 'upgrade' : 'try_now'
                                    });
                                }}>
                                {currentModalAlert.cta.text}
                            </Button>

                            {#if currentModalAlert.learnMore}
                                <Button
                                    text
                                    class="button"
                                    external
                                    fullWidthMobile
                                    href={currentModalAlert.learnMore.link({
                                        organization: $organization,
                                        project: $project
                                    })}>
                                    {currentModalAlert.learnMore.text}
                                </Button>
                            {/if}
                        </div>
                    </div>
                {/key}
            </article>
        </div>
    </div>

    <div class="main-alert-wrapper is-only-mobile" class:closed={!openModalOnMobile}>
        {#if openModalOnMobile}
            <div class="alert-container">
                <article class="card">
                    {#key currentModalAlert.id}
                        <button class="icon-inline-tag" on:click={() => handleClose()}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"
                                    fill="#97979B" />
                            </svg>
                        </button>

                        <div class="content-wrapper u-flex-vertical u-gap-16">
                            {#if $app.themeInUse === 'dark'}
                                <img
                                    src={currentModalAlert.src.dark}
                                    alt={currentModalAlert.title}
                                    class="showcase-image u-image-object-fit-contain u-block u-only-dark" />
                            {:else}
                                <img
                                    src={currentModalAlert.src.light}
                                    alt={currentModalAlert.title}
                                    class="showcase-image u-image-object-fit-contain u-block u-only-light" />
                            {/if}

                            {#if filteredModalAlerts.length > 1}
                                <div class="u-flex u-main-space-between u-cross-baseline">
                                    <span class="inline-tag feature-count-tag">
                                        Feature {currentIndex + 1} of {filteredModalAlerts.length}
                                    </span>

                                    <div class="u-flex u-gap-10">
                                        <button
                                            class="icon-cheveron-left"
                                            on:click={showPrevious}
                                            disabled={currentIndex === 0}
                                            class:active={currentIndex > 0} />

                                        <button
                                            class="icon-cheveron-right"
                                            on:click={showNext}
                                            disabled={currentIndex ===
                                                filteredModalAlerts.length - 1}
                                            class:active={currentIndex !==
                                                filteredModalAlerts.length - 1} />
                                    </div>
                                </div>
                            {/if}

                            <div class="u-flex-vertical u-gap-8 u-padding-inline-8">
                                <h3 class="body-text-2 u-bold">{currentModalAlert.title}</h3>

                                <span class="u-width-fit-content">
                                    {#if currentModalAlert.isHtml}
                                        {@html currentModalAlert.message}
                                    {:else}
                                        {currentModalAlert.message}
                                    {/if}
                                </span>
                            </div>

                            <div
                                class="buttons u-flex u-flex-vertical-mobile u-gap-4 u-padding-inline-8 u-padding-block-8">
                                <Button
                                    secondary={!hasOnlyPrimaryCta}
                                    class="button"
                                    href={shouldShowUpgrade
                                        ? $upgradeURL
                                        : currentModalAlert.cta.link({
                                              organization: $organization,
                                              project: $project
                                          })}
                                    external={!!currentModalAlert.cta.external}
                                    fullWidthMobile
                                    on:click={() => {
                                        openModalOnMobile = false;
                                        trackEvent('click_promo', {
                                            promo: currentModalAlert.id,
                                            type: shouldShowUpgrade ? 'upgrade' : 'try_now'
                                        });
                                    }}>
                                    {shouldShowUpgrade
                                        ? 'Upgrade plan'
                                        : currentModalAlert.cta.text}
                                </Button>

                                {#if currentModalAlert.learnMore}
                                    <Button
                                        text
                                        class="button"
                                        external
                                        fullWidthMobile
                                        on:click={() => (openModalOnMobile = false)}
                                        href={currentModalAlert.learnMore.link({
                                            organization: $organization,
                                            project: $project
                                        })}>
                                        {currentModalAlert.learnMore.text}
                                    </Button>
                                {/if}
                            </div>
                        </div>
                    {/key}
                </article>
            </div>
        {:else}
            {@const mobileConfig = getMobileWindowConfig()}
            <button
                class:showing={!openModalOnMobile}
                class="card notification-card u-width-full-line"
                on:click={() => {
                    if (mobileConfig.cta) {
                        // navigate manually!
                        triggerMobileWindowLink();
                    } else {
                        openModalOnMobile = true;
                    }
                }}>
                <div class="u-flex-vertical u-gap-4">
                    <div class="u-flex u-cross-center u-main-space-between">
                        <h3 class="body-text-2 u-bold">{mobileConfig.title}</h3>
                        <button on:click={hideAllModalAlerts}>
                            <span class="icon-x" />
                        </button>
                    </div>

                    <span class="u-width-fit-content">
                        {#if mobileConfig.html}
                            {@html mobileConfig.message}
                        {:else}
                            {mobileConfig.message}
                        {/if}
                    </span>
                </div>
            </button>
        {/if}
    </div>
{/if}

<style>
    .card {
        padding: 0.5rem;
    }

    .main-alert-wrapper {
        left: 1rem;
        z-index: 25;
        bottom: 1rem;
        position: fixed;
        max-width: 289px;
    }

    .feature-count-tag {
        font-size: 12px;
        font-weight: 400;
        width: fit-content;
        margin-inline-start: 0.5rem;
    }

    .icon-inline-tag {
        top: 1rem;
        right: 1rem;

        background: #fff;
        position: absolute;
        display: inline-flex;
        padding: var(--space-2, 4px);
        border-radius: var(--border-radius-S, 8px);
        border: hsl(var(--color-neutral-10)) solid 1px;
    }

    :global(.theme-dark) .icon-inline-tag {
        background: #1d1d21;
        border: hsl(var(--color-neutral-80)) solid 1px;
    }

    :global(.main-alert-wrapper .only-primary-cta) {
        width: 100%;
        text-align: center;
        justify-content: center;
    }

    .showcase-image.u-only-light {
        border-radius: 8px;
        border: 0.795px solid var(--border-neutral-strong, #d8d8db);
    }

    .showcase-image.u-only-dark {
        border-radius: 8px;
        border: 0.795px solid var(--border-neutral-strong, #414146);
    }

    .u-gap-10 {
        gap: 0.625rem;
    }

    .icon-cheveron-left,
    .icon-cheveron-right {
        opacity: 0.5;
        color: #97979b;
        width: var(--icon-size-M, 20px);
        height: var(--icon-size-M, 20px);
    }

    .active {
        opacity: 1;
    }

    @media (max-width: 768px) {
        .main-alert-wrapper {
            top: 50%;
            left: 50%;
            display: flex;
            min-width: 100%;
            min-height: 100%;
            max-width: 100vw;

            align-items: center;
            justify-content: center;
            backdrop-filter: blur(6px);
            transform: translate(-50%, -50%);
        }

        .main-alert-wrapper.closed {
            backdrop-filter: unset;
        }

        .notification-card {
            padding: var(--space-5, 10px) var(--space-6, 12px);
        }

        .main-alert-wrapper:has(.card.notification-card) {
            bottom: 0;
            top: unset;
            min-height: auto;
            padding-inline: 0.5rem;
        }

        .alert-container {
            max-width: 90vw;
        }
    }
</style>
