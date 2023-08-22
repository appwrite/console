<script lang="ts">
    import { FormItem, Helper, Label } from '.';

    export let label: string | undefined = undefined;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let indeterminate = false;
    export let required = false;
    export let disabled = false;

    export let element: HTMLInputElement | undefined = undefined;
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
    {#if label}
        <Label {required} {optionalText} hide={!showLabel} for={id}>
            {label}
        </Label>
    {/if}

    <div class="input-text-wrapper">
        <input
            {id}
            {disabled}
            {required}
            {indeterminate}
            type="checkbox"
            bind:this={element}
            bind:checked={value}
            on:invalid={handleInvalid}
            on:click />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
