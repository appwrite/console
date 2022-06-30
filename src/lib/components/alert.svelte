<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Buttons } from '../stores/notifications';

    export let dismissible = false;
    export let type: '' | 'info' | 'success' | 'warning' | 'danger' = 'info';
    export let buttons: Buttons[] = [];

    const dispatch = createEventDispatcher();
</script>

<section class={`alert is-${type} common-section`}>
    <div class="alert-grid">
        {#if dismissible}
            <button
                class="x-button"
                aria-label="close alert box"
                on:click={() => dispatch('dismiss')}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        {/if}
        <span class="icon-info" aria-hidden="true" />
        <div class="content">
            <h6 class="title">
                <slot name="title" />
            </h6>
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
