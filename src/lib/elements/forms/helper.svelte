<script lang="ts">
    export let type: false | 'success' | 'warning' | 'error' = 'warning';

    let icon = '';
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

        default:
            icon = '';
            break;
    }
</script>

<li class={`helper u-${type}`}>
    {#if icon !== ''}
        <span class={`icon-${icon}`} aria-hidden="true" />
    {/if}
    <span class="text">
        <slot />
    </span>
</li>
