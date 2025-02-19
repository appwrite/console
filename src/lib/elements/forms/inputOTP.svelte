<script lang="ts">
    import { SvelteComponent, onMount } from 'svelte';
    import { Helper, Label } from '.';
    import { Drop } from '$lib/components';

    export let label: string = undefined;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let pattern: string = null;
    export let patternError: string = '';
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let disabled = false;
    export let readonly = false;
    export let maxlength: number = null;
    export let autofocus = false;
    export let autocomplete = false;
    export let fullWidth = false;
    export let tooltip: string = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};

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

        if (patternError && element.validity.patternMismatch) {
            error = patternError;
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }

    type $$Events = {
        input: Event & { target: HTMLInputElement };
    };
</script>

{#if label}
    <Label {required} {hideRequired} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}{#if popover}
            <Drop isPopover bind:show display="inline-block">
                <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                &nbsp;<button
                    type="button"
                    on:click={() => (show = !show)}
                    aria-label="input tooltip">
                    <span
                        class="icon-info"
                        aria-hidden="true"
                        style:font-size="var(--icon-size-small)" />
                </button>
                <svelte:fragment slot="list">
                    <div
                        class="dropped card u-max-width-250"
                        style:--p-card-padding=".75rem"
                        style:--card-border-radius="var(--border-radius-small)"
                        style:box-shadow="var(--shadow-large)">
                        <svelte:component this={popover} {...popoverProps} />
                    </div>
                </svelte:fragment>
            </Drop>
        {/if}
    </Label>
{/if}

<div class="input-text-wrapper">
    <input
        {id}
        {name}
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {maxlength}
        {pattern}
        type="text"
        autocomplete={autocomplete ? 'on' : 'off'}
        class="input-text"
        bind:value
        bind:this={element}
        on:invalid={handleInvalid} />
    {#if $$slots.options}
        <div class="options-list">
            <slot name="options" />
        </div>
    {/if}
    <slot />
</div>
{#if error}
    <Helper type="warning" class="u-line-height-1">{error}</Helper>
{/if}
