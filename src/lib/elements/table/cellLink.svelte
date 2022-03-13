<script lang="ts">
	export let href: string;
	export let title: string;
</script>

<td class="table-col is-main" data-title={title}>
	<a role="button" tabindex="0" class="link" {href}><slot /></a>
</td>
