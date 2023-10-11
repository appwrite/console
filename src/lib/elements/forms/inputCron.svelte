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

    const pattern = String.raw`/^(\*|\?|[0-5]?\d)(\,(\*|\?|[0-5]?\d)|\-(\*|\?|[0-5]?\d)|\/\d+)?\s+(\*|\?|[01]?\d|2[0-3])(\,(\*|\?|[01]?\d|2[0-3])|\-(\*|\?|[01]?\d|2[0-3])|\/\d+)?\s+(\*|\?|[1-9]|[12]\d|3[01])(W?)(\,(\*|\?|[1-9]|[12]\d|3[01])|\-(\*|\?|[1-9]|[12]\d|3[01])|\/\d+)?\s+(\*|\?|[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\,(\*|\?|[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\-(\*|\?|[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\/\d+)?\s+(\*|\?|[0-7]((\#?)(\d?))(\w?)|sun|mon|tue|wed|thu|fri|sat)(\,(\*|\?|[0-7]((\#?)(\d?))(\w?)|sun|mon|tue|wed|thu|fri|sat)|\-(\*|\?|[0-7]((\#?)(\d?))(\w?)|sun|mon|tue|wed|thu|fri|sat)|\/\d((\#?)(\d?))(\w?)+)?$/i`;
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
            aria-label="Input"
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
