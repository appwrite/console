<script lang="ts">
    export let disabled = false;
    export let success = false;
    export let warning = false;
    export let danger = false;
    export let info = false;
    export let button = false;
</script>

<div
    class="tag"
    class:is-disabled={disabled}
    class:is-success={success}
    class:is-warning={warning}
    class:is-danger={danger}
    class:is-info={info}
    class:pill-is-button={button}
    on:click>
    <slot />
</div>

<style>
    .pill-is-button {
        cursor: pointer;
    }
</style>
