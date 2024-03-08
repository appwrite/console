<script lang="ts">
    export let indeterminate = false;
    export let checked = false;

    interface $$Props extends Partial<HTMLInputElement> {
        indeterminate?: boolean;
        checked?: boolean;
    }
</script>

<input type="checkbox" bind:checked {...$$restProps} bind:indeterminate on:change />
