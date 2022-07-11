<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let maxlength: number = null;

    let element: HTMLTextAreaElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <textarea
            {id}
            {placeholder}
            {disabled}
            {required}
            {maxlength}
            class="input-text"
            bind:value
            bind:this={element} />
    </div>
</FormItem>
