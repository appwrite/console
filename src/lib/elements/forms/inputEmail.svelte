<script lang="ts">
    import { SvelteComponent, onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import { Drop } from '$lib/components';
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let name: string | undefined = undefined;
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let tooltip: string = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};
    export let fullWidth = false;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();
        if (event.currentTarget.validity.typeMismatch) {
            error = 'Emails should be formatted as: name@example.com';
            return;
        }
        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = event.currentTarget.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Text
    {id}
    {name}
    {placeholder}
    {disabled}
    {required}
    {label}
    {nullable}
    {autofocus}
    on:input
    on:invalid={handleInvalid}
    type="email"
    helper={error}
    autocomplete={autocomplete ? 'on' : 'off'}
    bind:value />
