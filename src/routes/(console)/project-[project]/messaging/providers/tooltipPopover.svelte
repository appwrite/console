<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Popover, Tooltip } from '@appwrite.io/pink-svelte';
    import type { Component } from 'svelte';

    export let tooltip: string | undefined = undefined;
    export let popover: Component = null;
    export let popoverProps: Record<string, unknown> = {};
</script>

{#if tooltip}
    <Tooltip>
        <Icon icon={IconInfo} size="s" />
        <p slot="tooltip">{tooltip}</p>
    </Tooltip>
{:else if popover}
    <Popover let:toggle>
        <Button extraCompact size="s" on:click={toggle}>
            <Icon size="s" icon={IconInfo} />
        </Button>
        <svelte:component this={popover} {...popoverProps} slot="tooltip" />
    </Popover>
{/if}
