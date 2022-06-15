<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Notification } from '../stores/notifications';

    export let type: Notification['type'] = 'info';
    export let title: Notification['title'];
    export let func: Notification['func'];

    let icon: string;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation';
            break;

        case 'error':
            icon = 'exclamation-circle';
            break;

        case 'info':
            icon = 'info';
            break;

        default:
            icon = '';
            break;
    }

    const dispatch = createEventDispatcher();
</script>

<li class={`alert-sticky is-${type}`}>
    <button class="x-button" aria-label="close alert" on:click={() => dispatch('dismiss')}>
        <span class="icon-x" aria-hidden="true" />
    </button>
    <div class="alert-sticky-image">
        <span class={`icon-${icon}`} aria-hidden="true" />
    </div>
    <div class="alert-sticky-content">
        {#if title}
            <h4 class="alert-sticky-title">{title}</h4>
        {/if}
        <p><slot /></p>
    </div>
    {#if func}
        <div class="buttons u-flex">
            {#each func as f}
                <button class="button is-text is-small" on:click={f.method}>
                    <span class="text">{f.name}</span>
                </button>
            {/each}
        </div>
    {/if}
</li>
