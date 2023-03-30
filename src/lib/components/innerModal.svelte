<script>
    import { FormItem } from '$lib/elements/forms';

    export let show = false;
    export let closable = true;
</script>

{#if show}
    <FormItem>
        <section class="modal is-inner-modal">
            <div class="modal-form">
                <header class="modal-header">
                    <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                        <h4 class="modal-title body-text-1">
                            <slot name="title" />
                        </h4>
                        {#if closable}
                            <button
                                type="button"
                                class="button is-text is-only-icon"
                                style="--button-size:1.5rem;"
                                aria-label="Close"
                                title="Close"
                                on:click={() => (show = false)}>
                                <span class="icon-x" aria-hidden="true" />
                            </button>
                        {/if}
                    </div>
                    <p class="u-flex-basis-100-percent text u-small">
                        <slot name="subtitle" />
                    </p>
                </header>

                <div class="modal-content">
                    <slot name="content" />
                </div>
            </div>
        </section>
    </FormItem>
{/if}
