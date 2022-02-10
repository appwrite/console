<script lang="ts">
	export let submit = false;
	export let secondary = false;
	export let contrast = false;
	export let outline = false;
	export let disabled = false;
</script>

<button
	on:click
	{disabled}
	class:secondary
	class:contrast
	class:outline
	type={submit ? 'submit' : 'button'}
>
	<slot />
</button>
