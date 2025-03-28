<script lang="ts">
    export let type: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'warning';
    let classes = '';
    export { classes as class };
</script>

<p
    class="helper u-margin-block-start-8 {classes}"
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
            aria-hidden="true"></span>
    {/if}
    <span class="text u-line-height-1-5">
        <slot />
    </span>
</p>

<style lang="scss">
    .icon-info,
    .icon-exclamation-circle,
    .icon-check-circle,
    .icon-exclamation {
        &::before {
            vertical-align: baseline;
        }
    }
</style>
