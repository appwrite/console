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

    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        const element = event.target as HTMLInputElement;

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    };

    const isNotEmpty = (value: string | number | boolean) => {
        return typeof value === 'boolean' ? true : !!value;
    };

    $: if (isNotEmpty(value)) {
        error = null;
    }
</script>

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
    {required}
    state={error ? 'error' : 'default'}
    data-command-center-ignore
    on:invalid={handleInvalid}
    on:input
    on:change
    bind:value>
    <slot name="info" slot="info" />
</Input.Select>
