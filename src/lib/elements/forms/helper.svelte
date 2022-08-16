<script lang="ts">
    export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';
</script>

<p
    class="helper u-margin-block-start-12"
    class:u-info={type === 'info'}
    class:u-error={type === 'error'}
    class:u-success={type === 'success'}
    class:u-warning={type === 'warning'}
    class:u-neutral={type === 'neutral'}>
    {#if type}
        <span
            class:icon-info={type === 'info'}
            class:icon-error={type === 'error'}
            class:icon-success={type === 'success'}
            class:icon-warning={type === 'warning'}
            class:icon-neutral={type === 'neutral'}
            aria-hidden="true" />
    {/if}
    <span class="text">
        <slot />
    </span>
</p>
