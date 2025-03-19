<script lang="ts">
    import type { ProgressbarData, ProgressbarProps } from '$lib/components';
    import { Tooltip } from '@appwrite.io/pink-svelte';

    type $$Props = ProgressbarProps;

    /**
     * The max value of the progressbar
     */
    export let maxSize: $$Props['maxSize'];

    /**
     * The data for the progressbar
     */
    export let data: $$Props['data'];

    /**
     * The remaining value of the progressbar
     */
    $: remainder = data.reduce((sum: number, item: ProgressbarData) => sum - item.size, maxSize);
</script>

<section class="progressbar__container">
    {#each $$props.data as item}
        <Tooltip disabled={!item.tooltip}>
            <div
                class="progressbar__content"
                style:background-color={item.color}
                style:width={`${(item.size / maxSize) * 100}%`}>
            </div>
            <div slot="tooltip">
                <span class="u-bold">{item.tooltip.title}</span> ${item.tooltip.label}
            </div>
        </Tooltip>
    {/each}
    {#if remainder > 0}
        <div class="progressbar__content" style:width={`${(remainder / maxSize) * 100}%`} />
    {/if}
</section>

<style lang="scss">
    :root {
        --progressbar-border-radius: 0.25rem;
        --progressbar-tooltip-label-color: #818186;
        --progressbar-tooltip-link-color: #6c6c71;
    }

    :global(.theme-dark) {
        --progressbar-background-color: var(--neutral-800, #2d2d31);
        --progressbar-tooltip-background-color: var(--neutral-800, #2d2d31);
        --progressbar-tooltip-border-color: var(--neutral-80, #424248);
    }
    :global(.theme-light) {
        --progressbar-background-color: var(--neutral-40, #f4f4f7);
        --progressbar-tooltip-background-color: #ffffff;
        --progressbar-tooltip-border-color: #ededf0;
    }

    .progressbar {
        &__container {
            height: 0.5rem;
            background-color: var(--progressbar-background-color);
            border-radius: var(--progressbar-border-radius);
            display: flex;
            flex-direction: row;
            gap: 2px;
            margin-top: 1rem;
        }

        &__content {
            height: 100%;
            min-width: 4px;
            display: flex;
            justify-content: center;

            &::before {
                content: '';
                height: 2.5rem;
                margin-top: -1.25rem;
                width: 100%;
            }

            &:first-child {
                border-top-left-radius: var(--progressbar-border-radius);
                border-bottom-left-radius: var(--progressbar-border-radius);
            }
            &:last-child {
                border-top-right-radius: var(--progressbar-border-radius);
                border-bottom-right-radius: var(--progressbar-border-radius);
            }
        }
    }
</style>
