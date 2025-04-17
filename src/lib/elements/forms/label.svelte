<script lang="ts">
    import { Tooltip } from '@appwrite.io/pink-svelte';

    export let required = false;
    export let hideRequired = false;
    export let optionalText: string | undefined = undefined;
    export let hide = false;
    export let tooltip: string = null;
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
