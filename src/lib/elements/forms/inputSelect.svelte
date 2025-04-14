<script lang="ts">
    import { FormItem, FormItemPart, Helper, Label } from '.';
    import type { FormItemTag } from './formItem.svelte';
    import { Drop } from '$lib/components';
    import type { SvelteComponent } from 'svelte';

    export let id: string;
    export let label: string | undefined = undefined;
    export let ariaLabel = label;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let value: string | number | boolean | null;
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let disabled = false;
    export let wrapperTag: FormItemTag = 'li';
    export let options: {
        value: string | boolean | number | null;
        label: string;
        disabled?: boolean;
    }[];
    export let isMultiple = false;
    export let fullWidth = false;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};

    let element: HTMLSelectElement;
    let error: string;

    let show: boolean = false;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    };

    const isNotEmpty = (value: string | number | boolean) => {
        return typeof value === 'boolean' ? true : !!value;
    };

    $: if (required && !isNotEmpty(value)) {
        element?.setCustomValidity('This field is required');
    } else {
        element?.setCustomValidity('');
    }

    $: if (isNotEmpty(value)) {
        error = null;
    }

    $: hasNullOption = options.some((option) => option.value === null);
    $: wrapper = isMultiple ? FormItemPart : FormItem;
</script>

<svelte:component this={wrapper} {fullWidth} tag={wrapperTag}>
    {#if label}
        <Label {required} {hideRequired} {optionalText} hide={!showLabel} for={id}>
            {label}{#if popover}
                <Drop isPopover bind:show display="inline-block">
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
    {/if}

    <div class="select">
        <select
            {id}
            {required}
            {disabled}
            aria-label={ariaLabel}
            bind:this={element}
            bind:value
            on:invalid={handleInvalid}
            on:change>
            {#if placeholder && !hasNullOption}
                <option value={null} disabled selected hidden>{placeholder}</option>
            {/if}
            {#each options as option}
                <option
                    value={option.value}
                    selected={option.value === value}
                    disabled={option.disabled}>
                    {option.label}
                </option>
            {/each}
        </select>
        <span class="icon-cheveron-down" aria-hidden="true" />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {:else}
        <slot name="helper" />
    {/if}
</svelte:component>
