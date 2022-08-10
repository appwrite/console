<script lang="ts">
    export let type: false | 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';

    let icon = {
        info: 'icon-info',
        success: 'icon-check-circle',
        warning: 'icon-exclamation',
        error: 'icon-exclamation-circle',
        neutral: 'icon-info'
    };
</script>

<p class={`helper u-${type} u-margin-block-start-12"`}>
    {#if type}
        <span class={icon[type] ?? ''} aria-hidden="true" />
    {/if}
    <span class="text">
        <slot />
    </span>
</p>
