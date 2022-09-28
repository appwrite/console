<script lang="ts">
    export let single = false;
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<form role="form" class="form" class:common-section={single} on:submit|preventDefault>
    <slot />
</form>
