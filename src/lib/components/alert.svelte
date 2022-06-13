<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let dismissible = false;
    export let type: '' | 'info' | 'success' | 'warning' | 'danger' = 'info';

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
            <!--             
            <div class="buttons u-flex">
                <button class="button is-text">
                    <span class="text">Button</span>
                </button>
                <button class="button is-text">
                    <span class="text">Button</span>
                </button>
            </div> -->
        </div>
    </div>
</section>
