<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let optionalText: string | undefined = undefined;
    export let tooltip: string = null;

    let element: HTMLTextAreaElement;
    let error: string;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <textarea
            {id}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        {#if maxlength}
            <span class="text-counter" data-active={!!value}>
                <span class="text-counter-count">{value?.length ?? 0}</span>
                <span class="text-counter-separator" />
                <span class="text-counter-max">{maxlength}</span>
            </span>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>

<style class="scss">
    .text-counter {
        --p-text-counter-color: var(--color-neutral-50);
    }

    .text-counter[data-active='true'] {
        --p-text-counter-color: var(--color-neutral-70);
    }

    :global(.theme-dark) .text-counter {
        --p-text-counter-color: var(--color-neutral-70);
    }

    :global(.theme-dark) .text-counter[data-active='true'] {
        --p-text-counter-color: var(--color-neutral-50);
    }
</style>
