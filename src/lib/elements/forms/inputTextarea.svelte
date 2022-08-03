<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

    let element: HTMLTextAreaElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <textarea
            on:invalid={handleInvalid}
            {id}
            {placeholder}
            {disabled}
            {required}
            {maxlength}
            class="input-text"
            bind:value
            bind:this={element} />
    </div>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
