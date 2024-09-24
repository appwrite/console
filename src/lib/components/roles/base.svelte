<div class="u-flex-vertical u-gap-16">
    <slot />
</div>

<style>
    div {
        color: hsl(var(--color-neutral-50));

        &:first-child {
            color: hsl(var(--color-neutral-70));
        }
    }

    :global(.theme-dark) div {
        color: hsl(var(--color-neutral-20));

        &:first-child {
            color: hsl(var(--color-neutral-10));
        }
    }
</style>
