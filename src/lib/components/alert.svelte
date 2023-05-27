<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Buttons } from '../stores/notifications';

    export let dismissible = false;
    export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
    export let buttons: Buttons[] = [];

    const dispatch = createEventDispatcher();
</script>

<section
    class="alert"
    class:is-success={type === 'success'}
    class:is-warning={type === 'warning'}
    class:is-danger={type === 'error'}
    class:is-info={type === 'info'}>
    <div class="alert-grid">
        {#if dismissible}
            <button
                type="button"
                class="x-button"
                aria-label="close alert box"
                on:click={() => dispatch('dismiss')}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        {/if}
        <span
            class:icon-info={type === 'info'}
            class:icon-check-circle={type === 'success'}
            class:icon-exclamation={type === 'warning'}
            class:icon-exclamation-circle={type === 'error'}
            aria-hidden="true" />
        <div class="content">
            {#if $$slots.title}
                <h6 class="title">
                    <slot name="title" />
                </h6>
            {/if}
            <p class="message"><slot /></p>
            {#if buttons?.length}
                <div class="buttons u-flex">
                    {#each buttons as button}
                        <button class="button is-text" on:click={button.method}>
                            <span class="text">{button.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</section>
