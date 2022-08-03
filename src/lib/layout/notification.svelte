<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Notification } from '../stores/notifications';

    export let type: Notification['type'] = 'info';
    export let title: Notification['title'];
    export let buttons: Notification['buttons'];

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

<li class={`alert-sticky ${type ? typeClass[type] : ''}`}>
    <button class="x-button" aria-label="close alert" on:click={() => dispatch('dismiss')}>
        <span class="icon-x" aria-hidden="true" />
    </button>
    <div class="alert-sticky-image">
        <span class={type ? icon[type] : 'icon-info'} aria-hidden="true" />
    </div>
    <div class="alert-sticky-content">
        {#if title}
            <h4 class="alert-sticky-title">{title}</h4>
        {/if}
        <p><slot /></p>
    </div>
    {#if buttons}
        <div class="buttons u-flex">
            {#each buttons as button}
                <button class="button is-text is-small" on:click={button.method}>
                    <span class="text">{button.name}</span>
                </button>
            {/each}
        </div>
    {/if}
</li>
