<script lang="ts">
    interface $$Props extends Partial<HTMLLabelElement> {
        required?: boolean;
        hideRequired?: boolean;
        optionalText?: string | undefined;
        hide?: boolean;
        tooltip?: string;
        for?: string;
    }

    export let required: $$Props['required'] = false;
    export let hideRequired: $$Props['hideRequired'] = false;
    export let optionalText: $$Props['optionalText'] = undefined;
    export let hide: $$Props['hide'] = false;
    export let tooltip: $$Props['tooltip'] = null;
</script>

<label
    class:is-required={required && !hideRequired}
    class:u-hide={hide}
    class="label"
    {...$$restProps}>
    <slot />
</label>

{#if optionalText}
    <span class="optional u-margin-inline-start-8">{optionalText}</span>
{/if}

{#if tooltip}
    <button class="tooltip" aria-label="variables info">
        <span class="icon-info" aria-hidden="true" style="font-size: var(--icon-size-small)" />
        <span class="tooltip-popup" role="tooltip">
            <p class="text">
                {tooltip}
            </p>
        </span>
    </button>
{/if}
