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
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % filteredModalAlerts.length;
    }

    function showPrevious() {
        currentIndex = (currentIndex - 1 + filteredModalAlerts.length) % filteredModalAlerts.length;
    }
</script>

{#if filteredModalAlerts.length > 0}
    <div style="max-width: 289px;">
        <article class="is-not-mobile card promotional-card u-width-fit-content">
            {#if currentModalAlert}
                {#key currentModalAlert.id}
                    <div class="u-flex-vertical u-gap-16" style="padding-block: 0.5rem;">
                        <div class="showcase-image-wrapper">
                            <button
                                class="inline-tag"
                                on:click={() => handleClose(currentModalAlert)}>
                                <span class="icon-x" />
                            </button>

                            <img
                                height="132px"
                                src={currentModalAlert.src}
                                alt={currentModalAlert.title}
                                class:u-only-dark={$app.themeInUse === 'dark'}
                                class:u-only-light={$app.themeInUse === 'light'}
                                class="showcase-image u-image-object-fit-contain u-block" />
                        </div>

                        {#if filteredModalAlerts.length > 1}
                            <span class="feature-count-tag">
                                Feature {currentIndex + 1} of {filteredModalAlerts.length}
                            </span>
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

                        <div class="u-flex u-main-space-between u-cross-center">
                            <div
                                class="buttons u-flex u-gap-4 u-padding-inline-8 u-padding-block-8">
                                <Button
                                    secondary
                                    class="button"
                                    href={currentModalAlert.cta.link}
                                    external={!isCloud}
                                    on:click={() => handleClose(currentModalAlert)}>
                                    {currentModalAlert.cta.text}
                                </Button>

                                {#if currentModalAlert.learnMore && currentModalAlert.learnMore.link}
                                    <Button
                                        text
                                        class="button"
                                        external
                                        href={currentModalAlert.learnMore.link}>
                                        {currentModalAlert.learnMore.text
                                            ? currentModalAlert.learnMore.text
                                            : 'Learn More'}
                                    </Button>
                                {/if}
                            </div>

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
                    </div>
                {/key}
            {/if}
        </article>
    </div>
{/if}

<style>
    .card {
        padding: 0.5rem !important;
    }

    .promotional-card {
        left: 1rem;
        z-index: 25;
        bottom: 1rem;
        max-width: 300px;
        position: fixed;
    }

    .showcase-image {
        padding-inline: 1rem;
        padding-block: 0.5rem;
    }

    .showcase-image-wrapper {
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

    :global(.theme-dark) .showcase-image-wrapper {
        background:
            linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%) padding-box,
            linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(150, 150, 150, 0.1)) border-box;
    }

    /* TODO: check against Pink:V1 designs */
    .feature-count-tag {
        width: fit-content;
        align-items: center;
        justify-content: center;
        margin-inline-start: 0.5rem;
        border-radius: var(--border-radius-XS, 6px);
        padding: var(--space-1, 2px) var(--space-2, 4px);
        background: var(--color-overlay-on-neutral, rgba(0, 0, 0, 0.06));

        text-align: center;

        font-weight: 400;
        line-height: 130%;
        font-style: normal;
        letter-spacing: -0.12px;
        font-size: var(--font-size-XS, 12px);
        font-family: var(--font-family-sansSerif, Inter);
        color: var(--color-fgColor-neutral-secondary, #56565c);
    }

    /* TODO: check against Pink:V1 designs */
    :global(.theme-dark) .feature-count-tag {
        color: #a9a9a3;
        background: var(--color-overlay-on-neutral, rgba(255, 255, 255, 0.06));
    }

    .inline-tag {
        top: 0;
        right: 0;
        position: absolute;
        background: unset !important;
        border-radius: var(--border-radius-S, 8px);
        border: hsl(var(--p-inline-tag-bg-color-default)) solid 1px;
    }

    .u-gap-10 {
        gap: 0.625rem;
    }

    .icon-x {
        font-size: 1.25rem;
    }

    /* TODO: check against Pink:V1 designs */
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

    :global(.promotional-card .button) {
        border-radius: 0.75rem !important;
    }
</style>
