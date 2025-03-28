<script lang="ts">
    import { goto } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';

    export let previousPage: string = null;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    }

    function close() {
        if (previousPage) {
            goto(previousPage);
        } else {
            wizard.hide();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="cover-frame is-color-header" data-is-page={previousPage}>
    <header class="cover-frame-header">
        <slot name="header">
            <div
                class="container u-flex u-gap-16 u-main-space-between u-cross-center"
                style:--p-container-padding-block="0">
                <div class="u-flex u-gap-8 u-cross-center">
                    <div class="body-text-1 u-bold"><slot name="title" /></div>
                </div>
                <button
                    on:click={close}
                    class="button is-text is-only-icon"
                    style:--button-size="1.5rem"
                    aria-label="close popup">
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </div>
        </slot>
    </header>

    <div class="cover-frame-content u-flex u-flex-vertical u-overflow-y-auto">
        <slot />
    </div>
</section>

<style lang="scss">
    //style for cover with is-page data attribute
    .cover-frame[data-is-page] {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 30;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        overflow-y: auto;
        background: var(--bgcolor-neutral-primary);
    }
</style>
