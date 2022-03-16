<script lang="ts">
	export let show = false;
	export let position: 'top' | 'bottom' = 'top';
	export let horizontal: 'left' | 'right' = 'right';
	let parentElement: HTMLDivElement;

	const onBlur = (event: MouseEvent) => {
		if (show && !(event.target === parentElement || parentElement.contains(event.target as Node))) {
			show = false;
		}
	};
</script>

<svelte:window on:click={onBlur} />

<div class="drop-list-wrapper" bind:this={parentElement}>
	<slot />
	{#if show}
		<ul
			class="drop-list is-no-arrow"
			class:is-block-end={position === 'bottom'}
			class:is-inline-end={horizontal === 'left'}
		>
			<slot name="list" />
		</ul>
	{/if}
</div>
