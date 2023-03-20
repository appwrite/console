<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import TextCounter from './textCounter.svelte';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let optionalText: string | undefined = undefined;
    export let tooltip: string = null;

    let element: HTMLTextAreaElement;
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
        <textarea
            {id}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        {#if maxlength}
            <TextCounter max={maxlength} count={value?.length ?? 0} />
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
