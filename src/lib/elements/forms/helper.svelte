<script lang="ts">
    export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';
</script>

<p
    class="helper u-margin-block-start-8"
    class:u-color-text-info={type === 'info'}
    class:u-color-text-danger={type === 'error'}
    class:u-color-text-success={type === 'success'}
    class:u-color-text-warning={type === 'warning'}>
    {#if type}
        <span
            class:icon-info={type === 'info' || type === 'neutral'}
            class:icon-exclamation-circle={type === 'error'}
            class:icon-check-circle={type === 'success'}
            class:icon-exclamation={type === 'warning'}
            aria-hidden="true" />
    {/if}
    <span class="text">
        <slot />
    </span>
</p>
