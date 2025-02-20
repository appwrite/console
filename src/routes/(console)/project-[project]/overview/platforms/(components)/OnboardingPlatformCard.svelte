<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { Icon } from '@appwrite.io/pink-svelte';

    export let icon: ComponentType;
    export let iconSize: number | undefined = undefined;
    export let iconColor: string | undefined = undefined;

    let usableIconColor = `--icon-color, ${iconColor}`;
</script>

<div class="outer-card">
    <div class="inner-card" style="--icon-size: {iconSize ? `${iconSize}rem` : 'inherit'};">
        <!-- custom size; the icon has a cap at 24px -->
        <Icon {icon} color={usableIconColor} />
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

        // targeting `i` or `svg` doesn't seem to help.
        & :global(*) {
            width: var(--icon-size);
            height: var(--icon-size);
        }
    }

    :global(.theme-dark) {
        & .outer-card {
            background: rgba(255, 255, 255, 0.08);
        }

        & .inner-card {
            border: 0.54px solid rgba(237, 237, 240, 0.08);
            background: var(--color-bgColor-neutral-primary, #1d1d21);
        }
    }
</style>
