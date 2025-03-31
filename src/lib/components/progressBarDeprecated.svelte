<script lang="ts">
    export let name: string;
    export let icon: string = null;
    export let unit: string;
    export let used: number;
    export let max: number;
    export let status: null | 'warning' | 'error' = null;

    $: progress = Math.round((used / max) * 100);

    //TODO: depending on the data received, we could set the status
</script>

<section class="progress-bar">
    <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
        <h3 class="body-text-1 u-flex u-cross-baseline u-gap-4">
            {#if icon}
                <span class={`icon-${icon}`} aria-hidden="true"></span>
            {/if}
            <span class="text">{name}</span>
        </h3>
        <p
            class="u-medium u-bold"
            class:u-color-text-warning={status === 'warning'}
            class:u-color-text-danger={status === 'error'}>
            {progress}%
        </p>
    </div>
    <div
        class="progress-bar-container"
        class:is-warning={status === 'warning'}
        class:is-danger={status === 'error'}
        style:--graph-size={progress + '%'}>
    </div>
    <div class="u-flex u-gap-8 u-main-space-between u-cross-baseline">
        <span class="progress-bar-text-used">{used}{unit}</span>
        <span class="progress-bar-text-max">{max}{unit}</span>
    </div>
</section>
