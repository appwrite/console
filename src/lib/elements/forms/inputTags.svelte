<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let tags: string[] = [];
    export let placeholder = '';
    export let disabled = false;

    let value = '';
    let error: string;

    const handleInvalid = (event: Event) => {
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

<Input.Tags
    {label}
    {id}
    {placeholder}
    {disabled}
    bind:value={tags}
    helper={error}
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'} />
