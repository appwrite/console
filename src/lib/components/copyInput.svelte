<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { Label } from '$lib/elements/forms';
    import type { SvelteComponent } from 'svelte';
    import { Copy, Drop } from '.';

    export let value: string;
    export let label: string = null;
    export let optionalText: string | undefined = undefined;
    export let showLabel = false;
    export let labelTooltip: string = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};
    export let appendTo: Parameters<typeof tooltip>['1']['appendTo'] = undefined;

    let show = false;
</script>

<div>
    {#if label}
        <Label tooltip={labelTooltip} {optionalText} hide={!showLabel} for={label}>
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
    <div class="input-text-wrapper" style="--amount-of-buttons:1">
        <input id={label} type="text" {value} readonly />
        <div class="options-list">
            {#key appendTo}
                <Copy {value}>
                    <span class="icon-duplicate" aria-hidden="true" />
                </Copy>
            {/key}
        </div>
    </div>
</div>
