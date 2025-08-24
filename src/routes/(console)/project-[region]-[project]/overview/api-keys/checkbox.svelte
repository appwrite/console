<script lang="ts">
    export let indeterminate = false;
    export let checked = false;
    export let fontSize: $$Props['fontSize'] = 'medium';

    interface $$Props extends Partial<HTMLInputElement> {
        indeterminate?: boolean;
        checked?: boolean;
        fontSize?: 'small' | 'medium';
    }
</script>

<input
    class:is-small={fontSize === 'small'}
    type="checkbox"
    bind:checked
    {...$$restProps}
    bind:indeterminate
    on:change />
