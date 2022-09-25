<script lang="ts">
    export let commonSection = false;
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<form role="form" class="form" class:common-section={commonSection} on:submit|preventDefault>
    <slot />
</form>
