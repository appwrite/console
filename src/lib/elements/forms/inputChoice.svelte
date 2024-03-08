<script lang="ts">
    import { FormItem, Helper } from '.';

    export let type: 'checkbox' | 'switchbox' = 'checkbox';
    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
    export let tooltip: string = null;
    export let fullWidth = false;

    let element: HTMLInputElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();
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
    <label class="choice-item" for={id}>
        <input
            {id}
            {disabled}
            {required}
            type="checkbox"
            class:switch={type === 'switchbox'}
            aria-checked={value}
            bind:this={element}
            bind:checked={value}
            on:invalid={handleInvalid} />

        <div class="choice-item-content" class:u-width-full-line={fullWidth}>
            {#if (label && showLabel) || tooltip}
                <div class="u-flex u-gap-4">
                    {#if label}
                        <h6 class:u-hide={!showLabel} class="choice-item-title">
                            {label}
                        </h6>
                    {/if}
                    {#if tooltip}
                        <button type="button" class="tooltip" aria-label="variables info">
                            <span
                                class="icon-info"
                                aria-hidden="true"
                                style="font-size: var(--icon-size-small)" />
                            <span class="tooltip-popup" role="tooltip">
                                <p class="text">
                                    {tooltip}
                                </p>
                            </span>
                        </button>
                    {/if}
                </div>
            {/if}
            {#if $$slots.default}
                <p class="choice-item-paragraph"><slot /></p>
            {/if}
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
