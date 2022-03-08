<script lang="ts">
	export let id: string;
	export let label: string;
	export let files: FileList;
	export let required = false;
	export let disabled = false;
</script>

<label class="label" for={id}>{label}</label>
<div class="input-text-wrapper">
	<input {id} {disabled} {required} bind:files type="file" />
</div>
