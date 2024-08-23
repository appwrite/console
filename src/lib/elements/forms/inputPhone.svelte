<script lang="ts">
    import { SvelteComponent, onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import { Drop } from '$lib/components';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let minlength: number = null;
    export let maxlength: number = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};
    export let fullWidth = false;

    const pattern = String.raw`^\+[1-9]\d{1,14}$`;

    let element: HTMLInputElement;
    let error: string;
    let show = false;

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

        if (element.validity.patternMismatch) {
            error = `Allowed characters: leading '+' and maximum of ${maxlength - 1} digits`;
            return;
        }

        if (element.validity.tooShort) {
            error = `The value must contain leading ‘+’ and at least ${minlength - 1} digits `;
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem {fullWidth}>
    <Label {required} hide={!showLabel} for={id}>
        {label}{#if popover}
            <Drop isPopover bind:show display="inline-block">
                <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                &nbsp;<button
                    type="button"
                    on:click={() => (show = !show)}
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
    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {minlength}
            {maxlength}
            {pattern}
            {readonly}
            type="text"
            autocomplete={autocomplete ? 'on' : 'off'}
            bind:value
            bind:this={element}
            style:--amount-of-buttons={$$slots.options ? 1 : 0}
            on:invalid={handleInvalid} />
        {#if $$slots.options}
            <div class="options-list">
                <slot name="options" />
            </div>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
