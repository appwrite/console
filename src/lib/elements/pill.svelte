<script lang="ts">
	export let disabled = false;
	export let pending = false;
	export let failed = false;
	export let success = false;
</script>

<div
	class="pill"
	class:is-disabled={disabled}
	class:is-pending={pending}
	class:is-failed={failed}
	class:is-success={success}
>
	<slot />
</div>
