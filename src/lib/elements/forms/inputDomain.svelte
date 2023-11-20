<script lang="ts">
    import { onMount } from 'svelte';
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
    export let maxlength: number = null;

    // https://www.geeksforgeeks.org/how-to-validate-a-domain-name-using-regular-expression/
    const pattern = String.raw`^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,18}$`;

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

        if (element.validity.patternMismatch) {
            error = 'Must be a valid domain';
            return;
        }
        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} hide={!showLabel} for={id}>
        {label}{#if $$slots.popover}
            <Drop bind:show display="inline-block">
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
                    <div class="dropped card u-max-width-250" style="--p-card-padding: .75rem">
                        <slot name="popover" />
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
            {maxlength}
            {pattern}
            {readonly}
            type="text"
            autocomplete={autocomplete ? 'on' : 'off'}
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
