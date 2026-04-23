<script lang="ts">
    import { afterNavigate, beforeNavigate } from '$app/navigation';

    const minimum = 0.08;
    const maximum = 0.994;
    const settleTime = 700;
    const intervalTime = 700;
    const displayThresholdMs = 2000;
    const stepSizes = [0, 0.005, 0.01, 0.02];

    let running: boolean = false;
    let updater: ReturnType<typeof setInterval> | null = null;
    let completed = false;
    let width: number = 0;

    function getIncrement(n: number) {
        if (n >= 0 && n < 0.2) return 0.1;
        else if (n >= 0.2 && n < 0.5) return 0.04;
        else if (n >= 0.5 && n < 0.8) return 0.02;
        else if (n >= 0.8 && n < 0.99) return 0.005;
        return 0;
    }

    function reset() {
        width = minimum;
        running = true;
    }

    function animate() {
        if (updater) {
            // prevent multiple intervals by clearing before making
            clearInterval(updater);
        }
        running = true;
        updater = setInterval(() => {
            const randomStep = stepSizes[Math.floor(Math.random() * stepSizes.length)] ?? 0;
            const step = getIncrement(width) + randomStep;
            if (width < maximum) {
                width = width + step;
            }
            if (width > maximum) {
                width = maximum;
                stop();
            }
        }, intervalTime);
    }

    function start() {
        reset();
        animate();
    }

    function stop() {
        if (updater) {
            clearInterval(updater);
        }
    }

    function complete() {
        if (updater) clearInterval(updater);
        if (!running) return;
        width = 1;
        running = false;
        setTimeout(() => {
            // complete the bar first
            completed = true;
            setTimeout(() => {
                // after some time (long enough to finish the hide animation) reset it back to 0
                completed = false;
                width = 0;
            }, settleTime);
        }, settleTime);
    }

    let progressBarStartTimeout: ReturnType<typeof setTimeout> | null = null;
    beforeNavigate((nav) => {
        if (progressBarStartTimeout) {
            clearTimeout(progressBarStartTimeout);
            progressBarStartTimeout = null;
        }

        if (nav.to?.route.id) {
            // Internal navigation.
            if (displayThresholdMs > 0) {
                // Schedule a display of the progress bar in `displayThresholdMs` milliseconds.
                // This is to avoid flickering/flashing when the navigation is fast.
                progressBarStartTimeout = setTimeout(() => start(), displayThresholdMs);
            } else start();
        }
    });

    afterNavigate(() => {
        if (progressBarStartTimeout) {
            clearTimeout(progressBarStartTimeout);
            progressBarStartTimeout = null;
        }
        complete();
    });

    $: barStyle = (width && width * 100 && `width: ${width * 100}%;`) || '';
</script>

{#if width}
    <div class="progress-bar" class:progress-bar-hiding={completed} style={barStyle}></div>
{/if}

<style>
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        transition: width 0.2s ease-in-out;
        z-index: 15;
        background: hsl(var(--color-primary-200));
    }

    .progress-bar-hiding {
        transition: top 0.8s ease;
        top: -8px;
    }
</style>
