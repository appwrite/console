<script lang="ts">
	export let label: string;
	export let id: string;
	export let value = false;
	export let required = false;
	export let disabled = false;
</script>

<label class="label" for={id}>{label}</label>
<div class="input-text-wrapper">
	<input
		{id}
		{disabled}
		{required}
		type="checkbox"
		class="switch"
		role="switch"
		bind:checked={value}
	/>
</div>
