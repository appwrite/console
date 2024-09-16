<script lang="ts">
    import { ProgressBar, type ProgressbarData } from '$lib/components/progressbar';

    export let currentValue: string;
    export let currentUnit: string;
    export let maxValue: string;
    export let maxUnit: string;
    export let progressValue: number;
    export let progressMax: number;
    export let showBar = true;
    export let progressBarData: Array<ProgressbarData> = [];

    $: progress = Math.round((progressValue / progressMax) * 100);
</script>

<section class="progress-bar">
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <p>
                <span class="heading-level-4">{currentValue}</span>
                <span class="body-text-1 u-bold">{currentUnit}</span>
            </p>
            <p class="heading-level-4">{progress}%</p>
        </div>
        <p class="body-text-2">
            {maxValue}
            {maxUnit}
        </p>
    </div>
    {#if showBar && progressBarData.length > 0}
        <ProgressBar maxSize={progressMax} data={progressBarData} />
    {/if}
</section>
