<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: string = null;
    export let placeholder = '* * * * *';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let minlength: number = null;
    export let step: number | 'any' = 1;

    let element: HTMLInputElement;
    let error: string;

    /*
        Below is a regex pattern which allows us to validate the cron string.
        The pattern is not perfect, but it is a good start.
        Allowed values:
        - minute: 0-59
        - hour: 0-23
        - day of month: 1-31
        - month: 1-12
        - day of week: 0-6
        - wildcard *
        - step values
    */
    const pattern = "^(\\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\\*\\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\\*|([0-9]|1[0-9]|2[0-3])|\\*\\/([0-9]|1[0-9]|2[0-3])) (\\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\\*\\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\\*|([1-9]|1[0-2])|\\*\\/([1-9]|1[0-2])) (\\*|([0-6])|\\*\\/([0-6]))$";

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

        if (element.validity.patternMismatch) {
            error = 'Please enter a valid Cron expression';
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {minlength}
            {maxlength}
            {readonly}
            {step}
            {pattern}
            type="text"
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
