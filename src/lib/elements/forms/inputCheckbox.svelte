<script lang="ts">
    import { FormItem, Helper } from '.';
    import type { FormItemTag } from './formItem.svelte';

    interface $$Props extends Partial<HTMLLabelElement> {
        id: string;
        label?: string;
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
    <label class="choice-item" for={id}>
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
        <div class="choice-item-content">
            {#if label}
                <div class="choice-item-title">{label}</div>
            {/if}
            <slot name="description" />
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
