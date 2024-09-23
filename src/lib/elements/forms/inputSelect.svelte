<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { FormItemTag } from './formItem.svelte';

    export let id: string;
    export let label: string | undefined = undefined;
    export let ariaLabel = label;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let value: string | number | boolean | null;
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let disabled = false;
    export let wrapperTag: FormItemTag = 'li';
    export let options: {
        value: string | boolean | number | null;
        label: string;
    }[];
    export let isMultiple = false;
    export let fullWidth = false;

    let element: HTMLSelectElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    };

    const isNotEmpty = (value: string | number | boolean) => {
        return typeof value === 'boolean' ? true : !!value;
    };

    $: if (required && !isNotEmpty(value)) {
        element?.setCustomValidity('This field is required');
    } else {
        element?.setCustomValidity('');
    }

    $: if (isNotEmpty(value)) {
        error = null;
    }
</script>

<Input.Select
    {label}
    {options}
    {placeholder}
    {disabled}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    on:change
    bind:value />
