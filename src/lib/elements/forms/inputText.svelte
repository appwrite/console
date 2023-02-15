<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number = null;
    export let tooltip: string = null;

    let element: HTMLInputElement;
    let error: string;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            autocomplete={autocomplete ? 'on' : 'off'}
            type="text"
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        {#if maxlength}
            <span class="text-counter">
                <span class="text-counter-count">{value?.length ?? 0}</span>
                <span class="text-counter-separator" />
                <span class="text-counter-max">{maxlength}</span>
            </span>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
