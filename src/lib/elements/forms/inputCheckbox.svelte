<script lang="ts">
    import { FormItem, Helper } from '.';

    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;

    let element: HTMLInputElement;
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

    <div class="input-text-wrapper">
        <input
            {id}
            {disabled}
            {required}
            type="checkbox"
            bind:this={element}
            bind:checked={value}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
