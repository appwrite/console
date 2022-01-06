<script>
	import { createEventDispatcher } from 'svelte';

	import { Button } from '.';

	export let limit;
	export let offset;
	export let sum;

	const dispatch = createEventDispatcher();

	const next = () => {
		offset += limit;
		dispatch('change');
	};

	const prev = () => {
		offset -= limit;
		dispatch('change');
	};
</script>

{#if sum >= limit}
	<div class="grid">
		<Button on:click={prev} disabled={offset === 0} outline>{'<'}</Button>
		<Button on:click={next} disabled={sum - limit < offset} outline>{'>'}</Button>
	</div>
{/if}
