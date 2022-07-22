<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let meter = true;
    export let autocomplete = false;
    export let showPasswordButton = false;

    let element: HTMLInputElement;
    let showInPlainText = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    $: strength = value ? value.length * 10 : 0;
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        {#if showInPlainText}
            <input
                type="text"
                {id}
                name={id}
                {placeholder}
                {required}
                {disabled}
                autocomplete={autocomplete ? 'on' : 'off'}
                class="input-text"
                bind:value
                bind:this={element} />
        {:else}
            <input
                {id}
                {placeholder}
                {disabled}
                {required}
                autocomplete={autocomplete ? 'on' : 'off'}
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
</FormItem>
