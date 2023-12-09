<script lang="ts">
    export let currentValue: string;
    export let currentUnit: string;
    export let maxValue: string;
    export let maxUnit: string;
    export let progressValue: number;
    export let progressMax: number;
    export let showBar = true;
    export let status: null | 'warning' | 'error' = null;

    $: progress = Math.round((progressValue / progressMax) * 100);

    //TODO: depending on the data received, we could set the status
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
        <div
            class="progress-bar-container u-margin-block-start-16"
            class:is-warning={status === 'warning'}
            class:is-danger={status === 'error'}
            style:--graph-size={progress + '%'} />
    {/if}
</section>
