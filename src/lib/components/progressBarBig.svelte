<script lang="ts">
    import { ProgressBar, type ProgressbarData } from '$lib/components/progressbar';

    export let currentValue: string | undefined = undefined;
    export let currentUnit: string | undefined = undefined;
    export let maxValue: string | undefined = undefined;
    export let maxUnit: string | undefined = undefined;
    export let progressValue: number;
    export let progressMax: number | undefined = undefined;
    export let showBar = true;
    export let progressBarData: Array<ProgressbarData> = [];

    $: progress = Math.round((progressValue / progressMax) * 100);
</script>

<section class="progress-bar">
    {#if currentValue !== undefined && currentUnit !== undefined && progress !== undefined}
        <div class="u-flex u-flex-vertical">
            <div class="u-flex u-main-space-between">
                <p>
                    <span class="heading-level-4">{currentValue}</span>
                    <span class="body-text-1 u-bold">{currentUnit}</span>
                </p>
                {#if progressMax !== undefined}
                    <p class="heading-level-4">{progress}%</p>
                {/if}
            </div>

            {#if maxValue !== undefined}
                <p class="body-text-2">
                    {maxValue}
                    {maxUnit ? maxUnit : ''}
                </p>
            {/if}
        </div>
    {/if}
    {#if showBar && progressBarData.length > 0}
        <ProgressBar maxSize={progressMax} data={progressBarData} />
    {/if}
</section>
