<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let tags: string[] = [];
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let helper: string | undefined = undefined;
    export let pattern: string | undefined = undefined;

    let value = '';
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        const inputNode = event.currentTarget as HTMLInputElement;

        if (inputNode.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = inputNode.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Tags
    {label}
    {id}
    {placeholder}
    {disabled}
    {pattern}
    {required}
    bind:value={tags}
    helper={error || helper}
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}><slot name="info" slot="info" /></Input.Tags>
