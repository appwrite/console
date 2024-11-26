<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';
    import { Helper } from '.';
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
        size?: 's' | 'm';
    }

    export let id: string = '';
    export let label: string | undefined = undefined;
    export let checked = false;
    export let required = false;
    export let disabled = false;
    export let element: HTMLInputElement | undefined = undefined;
    export let wrapperTag: FormItemTag = 'li';
    export let size: $$Props['size'] = 's';
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

<div>
    <label class="choice-item" for={id}>
        <div class="input-text-wrapper">
            <Selector.Checkbox
                bind:checked
                {...$$restProps}
                {id}
                {disabled}
                {size}
                {label}
                {required}
                on:invalid={handleInvalid}
                on:click
                on:change />
        </div>
        <div class="choice-item-content">
            <slot name="description" />
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</div>
