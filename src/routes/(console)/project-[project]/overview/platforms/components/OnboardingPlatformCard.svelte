<script lang="ts">
    import type { Component } from 'svelte';

    export let icon: Component;
    export let iconSize: number | undefined = undefined;
    export let iconColor: string | undefined = undefined;
</script>

<div class="outer-card">
    <div
        class="inner-card"
        style="
            --icon-color: {iconColor || 'inherit'};
            --icon-size: {iconSize ? `${iconSize}rem` : 'inherit'};
        ">
        <svelte:component this={icon} />
    </div>
</div>

<style lang="scss">
    .outer-card {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 94.304px;
        height: 94.303px;
        flex-shrink: 0;
        border-radius: 26.944px;
        border: 1.684px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.5);
        box-shadow: 0 8.757px 8.757px 0 rgba(0, 0, 0, 0.04);
    }

    .inner-card {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80.832px;
        height: 80.831px;
        flex-shrink: 0;
        border-radius: 20.208px;
        background: #fff;
        border: 0.54px solid #ededf0;
        box-shadow: 0 6.736px 6.736px 0 rgba(0, 0, 0, 0.05);

        & :global(svg) {
            width: var(--icon-size);
            height: var(--icon-size);
            color: var(--icon-color);
        }
    }

    :global(.theme-dark) {
        & .outer-card {
            background: rgba(255, 255, 255, 0.08);
        }

        & .inner-card {
            border: 0.54px solid rgba(237, 237, 240, 0.08);
            background: var(--bgcolor-neutral-primary, #1d1d21);
        }
    }
</style>
