<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let meter = false;
    export let autocomplete = false;
    export let showPasswordButton = false;
    export let minlength = 8;
    export let maxlength: number = null;

    let element: HTMLInputElement;
    let error: string;
    let showInPlainText = false;

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
        if (element.validity.tooShort) {
            error = 'Password should contain at least 8 characters';
            return;
        }
        error = element.validationMessage;
    };

    $: strength = value ? value.length * 10 : 0;
    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        {#if showInPlainText}
            <input
                {id}
                {placeholder}
                {disabled}
                {minlength}
                {maxlength}
                name={id}
                type="text"
                class="input-text"
                autocomplete={autocomplete ? 'on' : 'off'}
                bind:value
                bind:this={element}
                on:invalid={handleInvalid} />
        {:else}
            <input
                {id}
                {placeholder}
                {disabled}
                {required}
                {minlength}
                {maxlength}
                type="password"
                class="input-text"
                autocomplete={autocomplete ? 'on' : 'off'}
                bind:value
                bind:this={element}
                on:invalid={handleInvalid} />
        {/if}

        {#if meter}
            <meter
                value={strength > 100 ? 100 : strength}
                min="0"
                max="100"
                class="password-meter"
                class:is-weak={strength !== 0 && strength <= 33}
                class:is-medium={strength > 33 && strength <= 66}
                class:is-strong={strength > 66 && strength <= 100}
                aria-label="Password strength weak" />
        {/if}
        {#if showPasswordButton}
            <button
                type="button"
                on:click={() => (showInPlainText = !showInPlainText)}
                class="show-password-button"
                aria-label="show password">
                <span
                    class:icon-eye={!showInPlainText}
                    class:icon-eye-off={showInPlainText}
                    aria-hidden="true" />
            </button>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
