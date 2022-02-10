<script lang="ts">
	export let horizontalScroll = false;
</script>

{#if horizontalScroll}
	<figure>
		<table>
			<slot />
		</table>
	</figure>
{:else}
	<table>
		<slot />
	</table>
{/if}
