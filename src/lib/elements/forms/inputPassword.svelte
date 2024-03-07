<script lang="ts">
    import { SvelteComponent, onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import { Drop } from '$lib/components';

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
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};
    export let fullWidth = false;

    let element: HTMLInputElement;
    let error: string;
    let showInPlainText = false;
    let showPopover = false;

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

<FormItem {fullWidth}>
    <Label {required} hide={!showLabel} for={id}>
        {label}{#if popover}
            <Drop isPopover bind:show={showPopover} display="inline-block">
                <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                &nbsp;<button
                    type="button"
                    on:click={() => (showPopover = !showPopover)}
                    class="tooltip"
                    aria-label="input tooltip">
                    <span
                        class="icon-info"
                        aria-hidden="true"
                        style="font-size: var(--icon-size-small)" />
                </button>
                <svelte:fragment slot="list">
                    <div
                        class="dropped card u-max-width-250"
                        style:--card-border-radius="var(--border-radius-small)"
                        style:--p-card-padding=".75rem"
                        style:box-shadow="var(--shadow-large)">
                        <svelte:component this={popover} {...popoverProps} />
                    </div>
                </svelte:fragment>
            </Drop>
        {/if}
    </Label>

    <div class="input-text-wrapper" style={showPasswordButton ? '--amount-of-buttons: 1' : ''}>
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
