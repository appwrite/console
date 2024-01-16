<script lang="ts">
    import { FormItem, Helper, Label } from '.';
    import type { FormItemTag } from './formItem.svelte';

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
        wrapperTag?: FormItemTag;
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
    export let wrapperTag: FormItemTag = 'li';

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

<FormItem tag={wrapperTag}>
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
