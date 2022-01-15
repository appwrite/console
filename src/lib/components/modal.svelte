<script lang="ts">
	export let show = false;

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			show = false;
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<dialog open>
		<article>
			<header>
				<span on:click={() => (show = false)} aria-label="Close" title="Close" class="close" />
				<slot name="header" />
			</header>

			<slot />
		</article>
	</dialog>
{/if}

<style>
	span.close {
		cursor: pointer;
	}
</style>
