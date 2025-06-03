<script lang="ts">
    export let count: number;
    export let max: number;
</script>

<span class="text-counter" class:active={count > 0}>
    <span class="text-counter-count">{count}</span>
    <span class="text-counter-separator"></span>
    <span class="text-counter-max">{max}</span>
</span>

<style lang="scss">
    .text-counter {
        --p-text-counter-color: var(--color-neutral-50);

        &.active {
            --p-text-counter-color: var(--color-neutral-70);
        }
    }

    :global(.theme-dark) .text-counter {
        --p-text-counter-color: var(--color-neutral-70);

        &.active {
            --p-text-counter-color: var(--color-neutral-50);
        }
    }
</style>
