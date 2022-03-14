<script lang="ts">
	export let label: string;
	export let id: string;
	export let value: string;
	export let required = false;
	export let disabled = false;
	export let options: {
		value: string;
		label: string;
	}[];
</script>

<label class="label" for={id}>{label}</label>
<div class="select">
	<select {value} {required} {disabled}>
		{#each options as option}
			<option value={option.value} selected={option.value === value}>
				{option.label}
			</option>
		{/each}
	</select>
	<span class="icon-down-open" aria-hidden="true" />
</div>
