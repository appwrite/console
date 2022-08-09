<script lang="ts">
    import { FormItem, Helper } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: string;
    export let required = false;
    export let disabled = false;
    export let options: {
        value: string;
        label: string;
    }[];
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

    let element: HTMLSelectElement;

    const handleInvalid = (event: Event) => {
        errorMessage = element.validationMessage;

        if (element.validity.valueMissing) {
            errorMessage = 'This field is required';
        }
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="select">
        <select
            on:invalid={handleInvalid}
            bind:this={element}
            bind:value
            {id}
            {required}
            {disabled}>
            {#each options as option}
                <option value={option.value} selected={option.value === value}>
                    {option.label}
                </option>
            {/each}
        </select>
        <span class="icon-cheveron-down" aria-hidden="true" />
    </div>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
