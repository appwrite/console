<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string;
	export let tags: string[] = [];
	export let placeholder = '';
	export let autofocus = false;

	let element: HTMLInputElement;
	let value: string;

	onMount(() => {
		if (element && autofocus) {
			element.focus();
		}
	});

	const handleInput = (e: KeyboardEvent) => {
		if (['Enter', 'Tab', ' '].includes(e.key)) {
			e.preventDefault();
			addValue();
		}
		if (['Backspace', 'Delete'].includes(e.key)) {
			if (value.length === 0) {
				removeValue(tags[tags.length - 1]);
			}
		}
	};

	const handleBlur = () => {
		addValue();
	};

	const addValue = () => {
		let tag = value.trim();
		if (tag.length === 0 || tags.includes(tag)) return;

		tags = [...tags, tag];
		value = '';
	};

	const removeValue = (value: string) => {
		tags = tags.filter((tag) => tag !== value);
	};
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	<span>{label}</span>
	<div class="tags">
		<ul>
			{#each tags as tag}
				<li on:click={() => removeValue(tag)}>{tag}</li>
			{/each}
		</ul>
		<input
			type="text"
			on:keydown={handleInput}
			on:blur={handleBlur}
			{placeholder}
			bind:value
			bind:this={element}
		/>
	</div>
</label>

<style lang="scss">
	.tags {
		-webkit-appearance: none;
		-moz-appearance: none;
		box-sizing: content-box;
		color: #313131;
		height: 1.5rem;
		line-height: 1.5rem;
		border: solid 1px black;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		display: block;
		width: calc(100% - 2rem);
		margin-bottom: 2rem;
		background: white;
		height: auto;
		cursor: text;

		ul {
			display: inline;
			white-space: pre-line;
			li {
				display: inline-block;
				margin-right: 0.5rem;
				padding: 0.25rem 0.5rem;
				cursor: pointer;
				-webkit-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
			}
		}

		input {
			display: inline-block;
			border: none;
			padding: 0;
			width: auto;
			margin: 0;
			max-width: 100%;
			min-width: 200px;
		}
	}
</style>
