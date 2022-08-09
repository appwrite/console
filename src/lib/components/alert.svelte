<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Buttons } from '../stores/notifications';

    export let dismissible = false;
    export let type: '' | 'info' | 'success' | 'warning' | 'danger' = 'info';
    export let buttons: Buttons[] = [];

    let icon = {
        success: 'icon-check-circle',
        warning: 'icon-exclamation',
        error: 'icon-exclamation-circle',
        info: 'icon-info'
    };

    let typeClass = {
        success: 'is-success',
        warning: 'is-warning',
        error: 'is-danger',
        info: 'is-info'
    };

    const dispatch = createEventDispatcher();
</script>

<section class={`alert ${type ? typeClass[type] : ''}`}>
    <div class="alert-grid">
        {#if dismissible}
            <button
                class="x-button"
                aria-label="close alert box"
                on:click={() => dispatch('dismiss')}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        {/if}
        <span class={type ? icon[type] : 'icon-info'} aria-hidden="true" />
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
