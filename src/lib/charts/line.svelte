<script lang="ts">
	import 'chart.js/auto';
	import { Chart, type ChartConfiguration } from 'chart.js';
	import { onMount } from 'svelte';
	let element: HTMLCanvasElement;

	const labels = ['January', 'February', 'March', 'April', 'May', 'June'];
	const data = {
		labels: labels,
		datasets: [
			{
				label: 'My First dataset',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: [0, 10, 5, 2, 20, 30, 45]
			}
		]
	};
	const config: ChartConfiguration = {
		type: 'line',
		data: data
	};

	onMount(() => {
		new Chart(element, config);
	});
</script>

<canvas bind:this={element} />
