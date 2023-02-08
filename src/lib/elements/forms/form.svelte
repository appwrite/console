<script lang="ts">
    export let noMargin = false;
    export let noStyle = false;
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<form role="form" class:form={!noStyle} class:common-section={!noMargin} on:submit|preventDefault>
    <slot />
</form>
