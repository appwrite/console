<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: number = null;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let minlength: number = null;

    let element: HTMLInputElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {minlength}
            {maxlength}
            type="number"
            class="input-text"
            bind:value
            bind:this={element} />
    </div>
</FormItem>
