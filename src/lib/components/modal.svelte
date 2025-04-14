<script lang="ts">
    import { Alert, ModalWrapper } from '$lib/components';
    import { trackEvent } from '$lib/actions/analytics';
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';
    import { beforeNavigate } from '$app/navigation';

    export let show = false;
    export let size: 'small' | 'big' | 'huge' = null;
    export let icon: string = null;
    export let iconNotMobile: boolean = false;
    export let state: 'success' | 'warning' | 'error' | 'info' = null;
    export let error: string = null;
    export let closable = true;
    export let closeByEscape = true;
    export let headerDivider = true;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';
    export let description = '';

    let alert: HTMLElement;

    beforeNavigate(() => {
        show = false;
    });

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<ModalWrapper bind:show {size} {headerDivider} {closeByEscape} let:close>
    <Form isModal {onSubmit}>
        <header class="modal-header">
            <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                <div class="u-flex u-cross-center u-gap-16">
                    {#if icon}
                        <div
                            class="avatar is-medium"
                            class:is-not-mobile={iconNotMobile}
                            class:is-success={state === 'success'}
                            class:is-warning={state === 'warning'}
                            class:is-danger={state === 'error'}
                            class:is-info={state === 'info'}>
                            <span class={`icon-${icon}`} aria-hidden="true" />
                        </div>
                    {/if}

                    <h4 class="modal-title heading-level-5">
                        <slot name="title">
                            {title}
                        </slot>
                    </h4>
                </div>
                {#if closable}
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
                {/if}
            </div>
            {#if description.length > 0}
                <p class="modal-description u-margin-block-start-4">
                    <slot name="description">
                        {description}
                    </slot>
                </p>
            {/if}
        </header>
        <div class="modal-content">
            <div class="modal-content-spacer u-flex-vertical u-gap-24 u-width-full-line">
                {#if error}
                    <div bind:this={alert}>
                        <Alert
                            dismissible
                            type="warning"
                            on:dismiss={() => {
                                error = null;
                            }}>
                            {error}
                        </Alert>
                    </div>
                {/if}
                <slot />
            </div>
        </div>

        {#if $$slots.footer}
            <div class="modal-footer">
                <div class="u-flex u-main-end u-gap-16">
                    <slot name="footer" />
                </div>
            </div>
        {/if}
    </Form>
</ModalWrapper>
