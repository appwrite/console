<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label = '';
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let spellcheck: boolean = undefined;
    export let maxlength: number = null;
    export let rows = 3;
    export let helper: string = '';

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
    {rows}
    autofocus={autofocus || undefined}
    helper={error || helper}
    state={error ? 'error' : 'default'}
    {spellcheck}
    on:invalid={handleInvalid}
    on:input
    bind:value>
    <slot name="info" slot="info" />
</Input.Textarea>
