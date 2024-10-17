<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let id: string;
    export let value = false;
    export let disabled = false;

    let element: HTMLInputElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Selector.Switch
    {label}
    {disabled}
    bind:checked={value}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid} />
