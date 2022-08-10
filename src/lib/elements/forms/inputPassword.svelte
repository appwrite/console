<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper } from '.';

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
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;
    export let minlength = 8;
    export let maxlength: number = null;

    let element: HTMLInputElement;
    let showInPlainText = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        errorMessage = element.validationMessage;
        console.log(element.validity);
        if (element.validity.valueMissing) {
            errorMessage = 'This field is required';
        }
        if (element.validity.tooShort) {
            errorMessage = 'Password should contain at least 8 characters';
        }
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
    $: strength = value ? value.length * 10 : 0;
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        {#if showInPlainText}
            <input
                on:invalid={handleInvalid}
                type="text"
                {id}
                name={id}
                {placeholder}
                {disabled}
                autocomplete={autocomplete ? 'on' : 'off'}
                {minlength}
                {maxlength}
                class="input-text"
                bind:value
                bind:this={element} />
        {:else}
            <input
                on:invalid={handleInvalid}
                {id}
                {placeholder}
                {disabled}
                {required}
                autocomplete={autocomplete ? 'on' : 'off'}
                {minlength}
                {maxlength}
                type="password"
                class="input-text"
                bind:value
                bind:this={element} />
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
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
