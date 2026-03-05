<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let id: string;
    export let label: string;
    export let tags: string[] = [];
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let helper: string | undefined = undefined;
    export let pattern: string | undefined = undefined;
    export let leadingIcon: ComponentType | undefined = undefined;
    export let max: number | undefined = undefined;

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

    $: {
        // filter out empty or whitespace-only tags
        const cleaned = tags.filter((tag) => tag.trim().length > 0);
        if (cleaned.length !== tags.length) {
            tags = cleaned;
        }
    }

    $: if (max !== undefined && tags.length > max) {
        error = `Maximum ${max} fields allowed`;
    } else if (max === undefined || tags.length <= max) {
        error = null;
    }

    $: isDisabled = disabled || (max !== undefined && tags.length >= max);
</script>

<Input.Tags
    {label}
    {id}
    {placeholder}
    disabled={isDisabled}
    {pattern}
    {required}
    {leadingIcon}
    bind:value={tags}
    helper={error || helper}
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}><slot name="info" slot="info" /></Input.Tags>

<style>
    /* hotfix due to root styles increasing block-size */
    :global(.tag) {
        border: none;
        block-size: unset;
    }
</style>
