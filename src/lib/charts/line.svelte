<script lang="ts">
    import 'chart.js/auto';
    import { Chart, type ChartDataset } from 'chart.js';
    import { onMount } from 'svelte';
    let element: HTMLCanvasElement;

    export let labels: string[];
    export let datasets: ChartDataset<'line'>[];

    onMount(() => {
        new Chart(element, {
            type: 'line',
            data: {
                datasets,
                labels
            },
            options: {
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        min: 0
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        caretPadding: 0
                    }
                }
            }
        });
    });
</script>

<canvas bind:this={element} />

<style>
    canvas {
        max-height: 12rem;
    }
</style>
