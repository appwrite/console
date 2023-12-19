<script lang="ts">
    import { wizard } from '$lib/stores/wizard';

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            wizard.hide();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="cover-frame is-color-header">
    <header class="cover-frame-header">
        <slot name="header">
            <div
                class="container u-flex u-gap-16 u-main-space-between u-cross-center"
                style:--p-container-padding-block="0">
                <div class="u-flex u-gap-8 u-cross-center">
                    <div class="body-text-1 u-bold"><slot name="title" /></div>
                </div>
                <button
                    on:click={wizard.hide}
                    class="button is-text is-only-icon"
                    style:--button-size="1.5rem"
                    aria-label="close popup">
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </div>
        </slot>
    </header>

    <div class="cover-frame-content u-flex u-flex-vertical u-overflow-y-auto">
        <slot />
    </div>
</section>
