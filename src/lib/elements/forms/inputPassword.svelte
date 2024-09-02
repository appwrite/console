<script lang="ts">
    import { SvelteComponent } from 'svelte';
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let meter = false;
    export let autocomplete = false;
    export let showPasswordButton = false;
    export let minlength = 8;
    export let maxlength: number = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};
    export let fullWidth = false;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        if (event.currentTarget.validity.tooShort) {
            error = 'Password should contain at least 8 characters';
            return;
        }
        error = event.currentTarget.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Password
    {id}
    {label}
    {required}
    {disabled}
    {autofocus}
    {minlength}
    {maxlength}
    autocomplete={autocomplete ? 'on' : 'off'}
    {placeholder}
    helper={error}
    on:invalid={handleInvalid}
    bind:value />
