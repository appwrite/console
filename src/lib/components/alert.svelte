<script lang="ts">
    import { createEventDispatcher, type ComponentProps } from 'svelte';
    import { Button } from '$lib/elements/forms';

    export let dismissible = false;
    export let type: 'info' | 'success' | 'warning' | 'error' | 'default' = 'info';
    export let buttons: (ComponentProps<Button> & {
        slot: string;
        onClick?: (e: MouseEvent) => void;
    })[] = [];
    export let isAction = false;
    export let isStandalone = false;
    let classes = '';
    export { classes as class };

    const dispatch = createEventDispatcher();
</script>

<section
    class="alert {classes}"
    class:is-action={isAction}
    class:is-standalone={isStandalone}
    class:is-success={type === 'success'}
    class:is-warning={type === 'warning'}
    class:is-danger={type === 'error'}
    class:is-info={type === 'info'}>
    <div class="alert-grid">
        {#if dismissible}
            <button
                type="button"
                class="button is-text is-only-icon"
                aria-label="close alert box"
                on:click={() => dispatch('dismiss')}>
                <span class="icon-x" aria-hidden="true"></span>
            </button>
        {/if}
        <span
            class:icon-info={type === 'info' || type === 'default'}
            class:icon-check-circle={type === 'success'}
            class:icon-exclamation={type === 'warning'}
            class:icon-exclamation-circle={type === 'error'}
            aria-hidden="true"></span>
        <div class="alert-content" data-private>
            {#if $$slots.title}
                <h6 class="alert-title">
                    <slot name="title" />
                </h6>
            {/if}

            {#if $$slots.default}
                <p class="alert-message"><slot /></p>
            {/if}
            <slot name="action">
                {#if ($$slots.buttons || buttons?.length) && !isAction}
                    <div class="alert-buttons u-flex">
                        <slot name="buttons">
                            {#each buttons as button}
                                <Button text {...button} on:click={button.onClick}>
                                    <span class="text">{button.slot}</span>
                                </Button>
                            {/each}
                        </slot>
                    </div>
                {/if}
            </slot>
        </div>
        {#if ($$slots.buttons || buttons?.length) && isAction}
            <div class="alert-buttons u-flex u-gap-16 u-cross-child-center">
                <slot name="buttons">
                    {#each buttons as button}
                        <Button text {...button} on:click={button.onClick}>
                            + <span class="text">{button.slot}</span>
                        </Button>
                    {/each}
                </slot>
            </div>
        {/if}
    </div>
</section>
