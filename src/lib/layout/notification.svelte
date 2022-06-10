<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Notification } from '../stores/notifications';

    export let type: Notification['type'] = 'info';
    export let title: Notification['title'];

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
    <!-- 
    <div class="buttons u-flex">
        <button class="button is-text is-small">
            <span class="text">Action 1</span>
        </button>
        <button class="button is-text is-small">
            <span class="text">Action 2</span>
        </button>
    </div>
-->
</li>
