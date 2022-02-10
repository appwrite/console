<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { Button } from '$lib/elements/forms';

	export let limit: number;
	export let offset: number;
	export let sum: number;

	const dispatch = createEventDispatcher();

	const next = () => {
		if (offset + limit > sum) {
			offset = sum;
		} else {
			offset += limit;
		}
		dispatch('change');
	};

	const prev = () => {
		if (offset - limit < 0) {
			offset = 0;
		} else {
			offset -= limit;
		}
		dispatch('change');
	};
</script>

{#if sum >= limit}
	<div class="grid">
		<Button on:click={prev} disabled={offset === 0} outline>{'<'}</Button>
		<Button on:click={next} disabled={sum - limit < offset} outline>{'>'}</Button>
	</div>
{/if}
