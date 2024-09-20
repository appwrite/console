<script lang="ts">
    import { isCloud } from '$lib/system';
    import { Button } from '$lib/elements/forms/index';
    import { shouldShowNotification, hideNotification } from '$lib/helpers/notifications';
    import { app } from '$lib/stores/app';
    import {
        type BottomModalAlertItem,
        bottomModalAlerts,
        dismissBottomModalAlert
    } from '$lib/stores/bottom-alerts';

    let currentIndex = 0;

    $: filteredModalAlerts = $bottomModalAlerts
        .sort((a, b) => b.importance - a.importance)
        .filter((alert) => alert.show && shouldShowNotification(alert.id));

    $: currentModalAlert = filteredModalAlerts[currentIndex] as BottomModalAlertItem;

    function handleClose(modalAlert: BottomModalAlertItem) {
        dismissBottomModalAlert(modalAlert.id);
        hideNotification(modalAlert.id);
        if (modalAlert.closed) modalAlert.closed();

        if (currentIndex === filteredModalAlerts.length - 1 && filteredModalAlerts.length > 1) {
            currentIndex = currentIndex - 1;
        } else {
            currentIndex = currentIndex % filteredModalAlerts.length;
        }
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % filteredModalAlerts.length;
    }

    function showPrevious() {
        currentIndex = (currentIndex - 1 + filteredModalAlerts.length) % filteredModalAlerts.length;
    }
</script>

{#if filteredModalAlerts.length > 0 && currentModalAlert}
    <div class="main-alert-wrapper">
        <div class="alert-container">
            <article class="card">
                {#key currentModalAlert.id}
                    <div class="content-wrapper u-flex-vertical u-gap-16">
                        <img
                            src={currentModalAlert.src}
                            alt={currentModalAlert.title}
                            class:u-only-dark={$app.themeInUse === 'dark'}
                            class:u-only-light={$app.themeInUse === 'light'}
                            class="showcase-image u-image-object-fit-contain u-block" />

                        <div>
                            <button
                                class="icon-inline-tag"
                                on:click={() => handleClose(currentModalAlert)}>
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
                        </div>

                        {#if filteredModalAlerts.length > 1}
                            <div class="u-flex u-main-space-between u-cross-center">
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
                                secondary
                                class="button"
                                href={currentModalAlert.cta.link}
                                external={!isCloud}
                                fullWidthMobile
                                on:click={() => handleClose(currentModalAlert)}>
                                {currentModalAlert.cta.text}
                            </Button>

                            {#if currentModalAlert.learnMore && currentModalAlert.learnMore.link}
                                <Button
                                    text
                                    class="button"
                                    external
                                    fullWidthMobile
                                    href={currentModalAlert.learnMore.link}>
                                    {currentModalAlert.learnMore.text
                                        ? currentModalAlert.learnMore.text
                                        : 'Learn More'}
                                </Button>
                            {/if}
                        </div>
                    </div>
                {/key}
            </article>
        </div>
    </div>
{/if}

<style>
    .card {
        padding: 0.5rem;
        overflow: hidden;
        position: relative;
        max-height: 383px;
    }

    .main-alert-wrapper {
        left: 1rem;
        z-index: 25;
        bottom: 1rem;
        position: fixed;
        max-width: 289px;
    }

    .showcase-image {
        height: 132px;
        min-width: 273px;
    }

    .feature-count-tag {
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
            min-width: 100vw;
            min-height: 100vh;

            align-items: center;
            justify-content: center;
            backdrop-filter: blur(6px);
            transform: translate(-50%, -50%);
        }

        .alert-container {
            max-width: 289px;
        }
    }
</style>
