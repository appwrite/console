<script lang="ts">
    import { ModalWrapper } from '$lib/components';
    import { trackEvent } from '$lib/actions/analytics';

    export let show = false;
    export let title = '';
    export let description = '';
    export let style = '';
</script>

<ModalWrapper bind:show let:close {style}>
    <div class="grid-1-1 u-width-full-line mk-grid">
        <div class="mk-grid-item-1 u-width-full-line">
            <slot name="side" />
        </div>
        <div class="u-padding-32 mk-grid-item-2">
            <header class="modal-header">
                <div class="u-flex u-main-space-between u-gap-16">
                    <h4 class="modal-title heading-level-5">
                        <slot name="title">
                            {title}
                        </slot>
                    </h4>
                    <button
                        type="button"
                        class="button is-text is-only-icon"
                        style="--button-size:1.5rem;"
                        aria-label="Close Modal"
                        title="Close Modal"
                        on:click={() =>
                            trackEvent('click_close_modal', {
                                from: 'button'
                            })}
                        on:click={close}>
                        <span class="icon-x" aria-hidden="true" />
                    </button>
                </div>
                <p class="u-margin-block-start-4">
                    <slot name="description">
                        {description}
                    </slot>
                </p>
            </header>
            <div class="modal-content">
                <slot />
            </div>
        </div>
    </div>
</ModalWrapper>

<style lang="scss">
    .mk-grid {
        overflow: hidden;
    }
    @media screen and (max-width: 768px) {
        .mk-grid {
            &-item-1 {
                order: 2;
                max-height: 16rem;
            }

            &-item-2 {
                order: 1;
            }
        }
    }
</style>
