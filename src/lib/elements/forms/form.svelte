<script lang="ts">
    export let noMargin = false;
    export let isWizard = false;
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<form role="form" class:form={!isWizard} class:common-section={!noMargin} on:submit|preventDefault>
    <slot />
</form>
