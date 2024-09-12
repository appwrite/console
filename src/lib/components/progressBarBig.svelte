<script lang="ts">
    import { ProgressBar } from '$lib/components/progressbar';

    export let currentValue: string;
    export let currentUnit: string;
    export let maxValue: string;
    export let maxUnit: string;
    export let progressValue: number;
    export let progressMax: number;
    export let showBar = true;
    export let minimum = 0;
    export let maximum = 100;

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
    {#if showBar}
        <ProgressBar maxSize={100} data={[{size: 10, color: '#85DBD8', tooltip: {title: "First Appwrite project", label: "107GB", linkTitle: "View usage", linkPath: "/something"}},{size: 20, color: '#68A3FE59', tooltip: {title: "Second Appwrite project", label: "107GB", linkTitle: "View usage", linkPath: "/something"}},{size: 10, color: '#7C67FE59', tooltip: {title: "Third Appwrite project", label: "107GB", linkTitle: "View usage", linkPath: "/something"}}]}/>
<!--        <div-->
<!--            class="progress-bar-container u-margin-block-start-16"-->
<!--            class:is-warning={progress >= 75 && progress < 100}-->
<!--            class:is-danger={progress >= 100}-->
<!--            style:&#45;&#45;graph-size={Math.max(Math.min(progress, maximum), minimum) + '%'} />-->
    {/if}
</section>
