<script lang="ts">
    import { Tooltip } from '@appwrite.io/pink-svelte';

    interface $$Props extends Partial<HTMLLabelElement> {
        required?: boolean;
        hideRequired?: boolean;
        optionalText?: string | undefined;
        hide?: boolean;
        tooltip?: string;
        for?: string;
        class?: string;
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
    <Tooltip placement="top">
        <span class="icon-info" aria-hidden="true" style="font-size: var(--icon-size-small)"></span>
        <div slot="tooltip">{tooltip}</div>
    </Tooltip>
{/if}
