<script lang="ts">
    export let type: false | 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';

    let icon = '';
    switch (type) {
        case 'neutral':
            icon = 'info';
            break;
        case 'info':
            icon = 'info';
            break;
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation';
            break;

        case 'error':
            icon = 'exclamation-circle';
            break;

        default:
            icon = '';
            break;
    }
</script>

<p class={`helper u-${type} u-margin-block-start-12"`}>
    {#if icon !== ''}
        <span class={`icon-${icon}`} aria-hidden="true" />
    {/if}
    <span class="text">
        <slot />
    </span>
</p>
