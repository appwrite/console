<script lang="ts">
    import { FormItem, Helper, Label } from '.';

    interface $$Props extends Partial<HTMLLabelElement> {
        id: string;
        label?: string;
        optionalText?: string;
        tooltip?: string;
        showLabel?: boolean;
        checked?: boolean;
        required?: boolean;
        disabled?: boolean;
        element?: HTMLInputElement | undefined;
        indeterminate?: boolean;
    }

    export let id: string;
    export let label: string | undefined = undefined;
    export let optionalText: string | undefined = undefined;
    export let tooltip: string = null;
    export let showLabel = true;
    export let checked = false;
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

    $: if (checked) {
        error = null;
    }
</script>

<FormItem>
    {#if label}
        <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
            {label}
        </Label>
    {/if}

    <div class="input-text-wrapper">
        <input
            {id}
            {disabled}
            {required}
            {...$$restProps}
            type="checkbox"
            bind:this={element}
            bind:checked
            on:invalid={handleInvalid}
            on:click
            on:change />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
