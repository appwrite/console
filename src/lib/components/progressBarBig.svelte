<script lang="ts">
    export let unit: string;
    export let used: number;
    export let max: number;
    export let status: null | 'warning' | 'error' = null;

    $: progress = Math.round((used / max) * 100);

    //TODO: depending on the data received, we could set the status
</script>

<section class="progress-bar">
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <p>
                <span class="heading-level-4">{used}</span>
                <span class="body-text-1 u-bold">{unit}</span>
            </p>
            <p class="heading-level-4">{progress}%</p>
        </div>
        <p class="body-text-2">
            {max}
            {unit}
        </p>
    </div>
    <div
        class="progress-bar-container u-margin-block-start-16"
        class:is-warning={status === 'warning'}
        class:is-danger={status === 'error'}
        style:--graph-size={progress + '%'} />
</section>
