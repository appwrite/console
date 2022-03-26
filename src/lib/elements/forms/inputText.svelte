<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let label: string;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let maxlength: number = null;

    let element: HTMLInputElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });
</script>

<FormItem>
    <label class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {maxlength}
            type="text"
            class="input-text"
            bind:value
            bind:this={element} />
    </div>
</FormItem>
