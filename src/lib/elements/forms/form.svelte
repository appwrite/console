<script lang="ts">
    export let noMargin = false;
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<form role="form" class="form" class:common-section={!noMargin} on:submit|preventDefault>
    <slot />
</form>
