<script lang="ts">
	export let label: string;
	export let value: boolean;
	export let required = false;
</script>

<label>
	<span>{label}</span>
	<input type="checkbox" bind:checked={value} role="switch" {required} />
</label>
