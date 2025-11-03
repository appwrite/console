<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let id: string;
    export let label: string | undefined = undefined;
    export let value: string | number | boolean | null;
    export let helper: string | undefined = undefined;
    export let autofocus: boolean | undefined = undefined;
    export let optionalText: string | number | boolean | null | undefined = undefined;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let options: {
        value: string | boolean | number | null;
        label: string;
        disabled?: boolean;
        leadingIcon?: ComponentType;
        leadingHtml?: string;
        badge?: string;
    }[];
    export let leadingIcon: ComponentType | undefined = undefined;

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

    const isNotEmpty = (value: string | number | boolean | null) => {
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

<!-- Hidden select for HTML5 validation -->
<select
    bind:this={element}
    {required}
    {disabled}
    bind:value
    on:invalid={handleInvalid}
    tabindex="-1"
    aria-hidden="true"
    style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;">
    <option value="" disabled selected={!isNotEmpty(value)}></option>
    {#each options as option}
        <option value={option.value} selected={option.value === value}>
            {option.label}
        </option>
    {/each}
</select>

<Input.Select
    {id}
    {label}
    {options}
    {optionalText}
    {placeholder}
    {disabled}
    {autofocus}
    {leadingIcon}
    helper={error ?? helper}
    state={error ? 'error' : 'default'}
    on:input
    on:change
    bind:value>
    <slot name="info" slot="info" />
</Input.Select>
