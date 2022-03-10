<script lang="ts">
	import { navigating } from '$app/stores';

	export let isOpen = false;

	navigating.subscribe(() => {
		if (isOpen) isOpen = false;
	});
</script>

<main class="grid-with-side" class:is-open={isOpen}>
	<header class="main-header">
		<button
			class="icon-button is-no-desktop"
			aria-label="Open Menu"
			on:click={() => (isOpen = !isOpen)}
		>
			<span class="icon-dot-3" aria-hidden="true" />
		</button>
		<slot name="header" />
	</header>
	<nav class="main-side">
		<slot name="side" />
	</nav>
	<section class="main-content">
		<slot />
	</section>
</main>

<style>
	.grid-with-side {
		min-height: 100vh;
	}

	.main-content {
		max-width: 64rem;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
