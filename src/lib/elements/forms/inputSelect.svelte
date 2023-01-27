<script lang="ts">
    import { FormItem, Helper } from '.';

    export let id: string;
    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let value: string | number | boolean;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let options: {
        value: string | boolean | number;
        label: string;
    }[];

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

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <span class:u-hide={!showLabel || !optionalText} class="optional">{optionalText}</span>

    <div class="select">
        <select
            {id}
            {required}
            {disabled}
            bind:this={element}
            bind:value
            on:invalid={handleInvalid}>
            {#if placeholder}
                <option value={null} disabled selected hidden>{placeholder}</option>
            {/if}
            {#each options as option}
                <option value={option.value} selected={option.value === value}>
                    {option.label}
                </option>
            {/each}
        </select>
        <span class="icon-cheveron-down" aria-hidden="true" />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
