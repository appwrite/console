<script lang="ts">
	export let label: string;
	export let files: FileList;
	export let required = false;
</script>

<label>
	<span>{label}</span>
	<input type="file" bind:files {required} />
</label>
