<script module lang="ts">
    export type SortDirection = 'asc' | 'desc' | 'default';
</script>

<script lang="ts">
    import { Query } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconChevronUp, IconSelector } from '@appwrite.io/pink-icons-svelte';
    import type { Writable } from 'svelte/store';

    let {
        column,
        state,
        onSort = () => {},
        disabled = false
    }: {
        column: string;
        disabled?: boolean;
        onSort?: (query: string[]) => void | Promise<void>;
        state?: Writable<{ column: string | null; direction: SortDirection }>;
    } = $props();

    function sort() {
        const isCurrent = $state.column === column;
        const nextDir: SortDirection = !isCurrent
            ? 'asc'
            : $state.direction === 'asc'
              ? 'desc'
              : $state.direction === 'desc'
                ? 'default'
                : 'asc';

        state?.set({
            direction: nextDir,
            column: nextDir === 'default' ? null : column
        });

        if (nextDir === 'default') {
            onSort?.([]);
        } else if (nextDir === 'asc') {
            onSort?.([Query.orderAsc(column)]);
        } else {
            onSort?.([Query.orderDesc(column)]);
        }
    }
</script>

<Button extraCompact on:click={sort} class="hoverable-compact" {disabled}>
    <Icon
        size="s"
        icon={$state?.column !== column || $state?.direction === 'default'
            ? IconSelector
            : $state?.direction === 'asc'
              ? IconChevronUp
              : IconChevronDown}
        color="--fgcolor-neutral-weak" />
</Button>

<style lang="scss">
    :global(.hoverable-compact) {
        width: 20px;
        height: 20px;
        --p-button-padding-inline: var(--space-0);

        &:hover {
            background-color: var(--bgcolor-neutral-secondary);
            border: var(--border-width-s) solid var(--bgcolor-neutral-secondary);

            & :global(i) {
                --icon-fill: var(--fgcolor-neutral-secondary) !important;
            }
        }

        &:active {
            background-color: var(--bgcolor-neutral-tertiary);
            border: var(--border-width-s) solid var(--bgcolor-neutral-tertiary);
        }

        &:disabled {
            & :global(i) {
                --icon-fill: var(--fgcolor-neutral-secondary) !important;
            }
        }
    }
</style>
