<script lang="ts">
    import { navigating } from '$app/stores';

    let width: number;
    let updater: ReturnType<typeof setTimeout>;
    let completed = false;

    const minimum = 0.08;
    const maximum = 0.994;
    const settleTime = 700;
    const intervalTime = 800;
    const stepSizes = [0, 0.005, 0.01, 0.02];

    function animate(): void {
        if (updater) {
            clearInterval(updater);
        }
        updater = setInterval(() => {
            const randomStep = stepSizes[Math.floor(Math.random() * stepSizes.length)];
            const step = getIncrement(width) + (randomStep ?? 0);
            if (width < maximum) {
                width = width + step;
            }
            if (width > maximum) {
                width = maximum;
                stop();
            }
        }, intervalTime);
    }

    function start(): void {
        width = minimum;
        animate();
    }

    function complete(): void {
        clearInterval(updater);
        width = 1;
        setTimeout(() => {
            completed = true;
            setTimeout(() => {
                completed = false;
                width = 0;
            }, settleTime);
        }, settleTime);
    }

    function getIncrement(number: number): number {
        if (number >= 0 && number < 0.2) return 0.1;
        else if (number >= 0.2 && number < 0.5) return 0.04;
        else if (number >= 0.5 && number < 0.8) return 0.02;
        else if (number >= 0.8 && number < 0.99) return 0.005;
        return 0;
    }

    $: if ($navigating) {
        start();
    } else {
        complete();
    }

    $: barStyle = (width && width * 100 && `width: ${width * 100}%;`) || '';
</script>

{#if width}
    <div class="progress-bar" class:progress-bar-hiding={completed} style={barStyle} />
{/if}

<style>
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        transition: width 0.2s ease-in-out;
        z-index: 5;
        background: hsl(var(--color-primary-200));
    }

    .progress-bar-hiding {
        transition: top 0.8s ease;
        top: -8px;
    }
</style>
