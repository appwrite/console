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
        size?: 'small' | 'medium';
    }

    export let id: string;
    export let label: string | undefined = undefined;
    export let checked = false;
    export let required = false;
    export let disabled = false;
    export let element: HTMLInputElement | undefined = undefined;
    export let wrapperTag: FormItemTag = 'li';
    export let size: $$Props['size'] = 'medium';
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
                class:is-small={size === 'small'}
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

<style>
    /* TODO: remove this block once Pink V2 is incorporated */
    :global(.theme-dark) input[type='checkbox']:not(:checked) {
        background-color: transparent; /* take whatever color is behind*/
        border: 1px solid var(--color-mid-neutral-70, #56565c);
    }
</style>
