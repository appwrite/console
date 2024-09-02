<script lang="ts">
    import { SvelteComponent, onMount } from 'svelte';
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = undefined;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let fullWidth = false;
    export let maxlength: number = null;
    export let tooltip: string = null;
    export let isMultiple = false;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = event.currentTarget.validationMessage;
    };

    $: {
        if (value) {
            error = null;
        }
    }

    type $$Events = {
        input: Event & { target: HTMLInputElement };
    };
</script>

<Input.Text
    {id}
    {name}
    {placeholder}
    {disabled}
    {required}
    {maxlength}
    {label}
    {nullable}
    {autofocus}
    helper={error}
    on:invalid={handleInvalid}
    on:input
    autocomplete={autocomplete ? 'on' : 'off'}
    bind:value />
