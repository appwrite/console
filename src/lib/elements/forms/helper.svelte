<script lang="ts">
    export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';
</script>

<p
    class="helper u-margin-block-start-12"
    class:u-info={type === 'info'}
    class:u-error={type === 'error'}
    class:u-success={type === 'success'}
    class:u-warning={type === 'warning'}>
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
