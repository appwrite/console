<script lang="ts">
    import type { ProgressbarData, ProgressbarProps } from '$lib/components';

    type $$Props = ProgressbarProps;

    /**
     * The max value of the progressbar
     */
    export let maxSize: $$Props['maxSize'];

    /**
     * The remaining value of the progressbar
     */
    let remainder = $$props.data.reduce((sum:number, item:ProgressbarData) => sum - item.size, maxSize);

</script>
<section class="progressbar__container">
    {#each $$props.data as item}
        <div class="progressbar__content" style="background-color:{item.color}; width: {(item.size/maxSize)*100}%;">
            {#if item.tooltip}
                <div class="progressbar__content-tooltip">
                    <div>
                    <span class="progressbar__content-tooltip-title">{item.tooltip.title}</span>
                    <span class="progressbar__content-tooltip-label">{item.tooltip.label}</span>
                    </div>
                        <a href="{item.tooltip.linkPath}">{item.tooltip.linkTitle}</a>
                </div>
            {/if}
        </div>
    {/each}
    {#if remainder > 0}
        <div class="progressbar__content" style="width: {(remainder/maxSize)*100}%;"/>
    {/if}
</section>


<style lang="scss">
    @use './progressbar';
    @include progressbar.base;
</style>