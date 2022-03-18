<script lang="ts">
	import { createEventDispatcher } from 'svelte';

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

	$: noPrev = offset === 0;
	$: noNext = sum - limit < offset;
	$: currentPage = offset / limit + 1;
	$: totalPages = Math.ceil(sum / limit);
</script>

{#if sum >= limit}
	<nav class="pagination is-center">
		<span
			on:click={prev}
			disabled={noPrev}
			class:is-disabled={noPrev}
			class="button is-only-icon"
			aria-label="previous page"
		>
			<span class="icon-left-open" aria-hidden="true" />
		</span>
		<span class="pagination-info">{currentPage} / {totalPages}</span>
		<span
			on:click={next}
			disabled={noNext}
			class:is-disabled={noNext}
			class="button is-only-icon"
			aria-label="next page"
		>
			<span class="icon-right-open" aria-hidden="true" />
		</span>
	</nav>
{/if}
