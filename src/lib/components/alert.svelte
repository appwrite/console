<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Func } from '../stores/notifications';

    export let dismissible = false;
    export let type: '' | 'info' | 'success' | 'warning' | 'danger' = 'info';
    export let func: Func[] = [];

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
            {#if func?.length}
                <div class="buttons u-flex">
                    {#each func as f}
                        <button class="button is-text" on:click={f.method}>
                            <span class="text">{f.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</section>
