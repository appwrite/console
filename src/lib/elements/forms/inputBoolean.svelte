<script lang="ts">
	export let label: string;
	export let value = false;
	export let required = false;
	export let disabled = false;
</script>

<label>
	<span>{label}</span>
	<input type="checkbox" bind:checked={value} role="switch" {required} {disabled} />
</label>
