<script lang="ts">
	export let href: string;
	export let icon: string = null;
</script>

<li class="drop-list-item">
	<a {href} class="drop-list-button">
		{#if icon}
			<span class={`icon-${icon}`} aria-hidden="true" />
		{/if}
		<span class="text"><slot /></span>
	</a>
</li>
