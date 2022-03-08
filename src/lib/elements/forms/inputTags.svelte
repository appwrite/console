<script lang="ts">
	import { onMount } from 'svelte';

	export let id: string;
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

<label class="label" for={id}>{label}</label>
<div class="input-text-wrapper">
	<div class="tags-input">
		<div class="tags">
			<ul class="tags-list">
				{#each tags as tag}
					<li class="tags-item">
						<div class="tag">
							<span class="tag-text">{tag}</span>
							<button
								class="x-button"
								aria-label={`delete ${tag} tag`}
								on:click={() => removeValue(tag)}
							>
								<span class="icon-cancel" aria-hidden="true" />
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<input
			type="text"
			class="tags-input-text"
			{id}
			{placeholder}
			on:keydown={handleInput}
			on:blur={handleBlur}
			bind:value
			bind:this={element}
		/>
	</div>
</div>
