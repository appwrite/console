<script lang="ts">
	export let show = false;

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			show = false;
		}
	};

	const handleBLur = (event: MouseEvent) => {
		const target: Partial<HTMLElement> = event.target;
		if (target.hasAttribute('data-curtain')) {
			show = false;
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<div class="modal-curtain" data-curtain on:click={handleBLur}>
		<section class="modal">
			<header class="modal-header">
				<h4 class="modal-title">
					<slot name="header" />
				</h4>
				<button
					type="button"
					class="x-button"
					aria-label="Close Modal"
					title="Close Modal"
					on:click={() => (show = false)}
				>
					<span class="icon-cancel" aria-hidden="true" />
				</button>
			</header>
			<div class="modal-content">
				<slot />
			</div>
			<div class="modal-footer">
				<div class="u-flex u-gap-10">
					<slot name="footer" />
				</div>
			</div>
		</section>
	</div>
{/if}
