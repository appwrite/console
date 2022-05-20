<script lang="ts">
    export let disabled = false;
    export let success = false;
    export let warning = false;
    export let danger = false;
    export let info = false;
</script>

<div
    class="tag"
    class:is-disabled={disabled}
    class:is-success={success}
    class:is-warning={warning}
    class:is-danger={danger}
    class:is-info={info}>
    <slot />
</div>
