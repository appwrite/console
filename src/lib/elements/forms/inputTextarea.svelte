<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import TextCounter from './textCounter.svelte';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let optionalText: string | undefined = undefined;
    export let tooltip: string = null;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
        event.preventDefault();
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

<Input.Textarea
    {id}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {maxlength}
    {label}
    {nullable}
    autofocus={autofocus || undefined}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    bind:value />
