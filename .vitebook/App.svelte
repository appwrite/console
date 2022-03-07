<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	export let component: typeof SvelteComponent;
</script>

<svelte:component this={component} />

<style lang="scss" global>
	$primary-500: #f02e65;
	$primary-600: #d81b60;
	$primary-700: #c2185b;
	$line-height: 1rem;
	$typography-spacing-vertical: 1rem;

	@import '@picocss/pico/scss/pico';
</style>
