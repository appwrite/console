<script lang="ts">
	export let submit = false;
	export let secondary = false;
	export let outline = false;
	export let danger = false;
	export let disabled = false;
</script>

<button
	on:click
	{disabled}
	class="button"
	class:is-secondary={secondary}
	class:is-outline={outline}
	class:is-danger={danger}
	type={submit ? 'submit' : 'button'}
>
	<slot />
</button>
