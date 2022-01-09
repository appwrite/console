<script lang="ts">
	export let width: number = null;
</script>

<td width={width?.toString() ?? ''}>
	<slot />
</td>

<style>
	td {
		white-space: nowrap;
	}
</style>
