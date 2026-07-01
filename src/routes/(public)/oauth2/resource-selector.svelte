<script lang="ts">
    import { Badge, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import {
        IconPlus,
        IconPencil,
        IconCheck,
        IconExclamationCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { InputSearch } from '$lib/elements/forms';
    import {
        WILDCARD_IDENTIFIER,
        type ResolvedResource,
        type ResourceNameMap
    } from '$lib/helpers/oauth2-authorization-details';

    interface Props {
        /** Plural label, e.g. `projects`. */
        pluralLabel: string;
        /** Identifiers the client requested (may be `['*']`). Defines the universe. */
        requested: string[];
        /** Current selection (`['*']` = all). Two-way bound to the parent. */
        selected: string[];
        /** Live search over the selectable universe. */
        find: (term: string) => Promise<ResolvedResource[]>;
        /** Resolve specific requested ids to display names. */
        resolveNames: (ids: string[]) => Promise<ResourceNameMap>;
        disabled?: boolean;
    }

    let {
        pluralLabel,
        requested,
        selected = $bindable(),
        find,
        resolveNames,
        disabled = false
    }: Props = $props();

    const wildcard = $derived(requested.includes(WILDCARD_IDENTIFIER));
    const isAll = $derived(selected.includes(WILDCARD_IDENTIFIER));
    const specificIds = $derived(selected.filter((id) => id !== WILDCARD_IDENTIFIER));
    // Nothing selected — the tier grants nothing until the user picks a resource.
    const isEmpty = $derived(!isAll && specificIds.length === 0);

    // Whether the current selection still matches exactly what was requested.
    const isDefault = $derived(
        selected.length === requested.length && selected.every((id) => requested.includes(id))
    );

    // Search (which can *add* resources) is only offered when narrowing a
    // wildcard grant — every match is still within the requested `*`, so it stays
    // downscope-only. A specific requested list is fixed: the user can remove
    // from it but never add resources the client didn't ask for.
    const searchable = $derived(wildcard && !isAll);

    let expanded = $state(false);
    let names = $state<Record<string, ResolvedResource>>({});
    let term = $state('');
    let results = $state<ResolvedResource[]>([]);
    let searching = $state(false);

    function labelFor(id: string): ResolvedResource {
        return names[id] ?? { id, name: id, resolved: false };
    }

    // Resolve the requested specific ids so chips show real names.
    $effect(() => {
        const ids = requested.filter((id) => id !== WILDCARD_IDENTIFIER);
        if (ids.length === 0) return;
        let cancelled = false;
        void resolveNames(ids).then((map) => {
            if (!cancelled) names = { ...names, ...Object.fromEntries(map) };
        });
        return () => {
            cancelled = true;
        };
    });

    // Debounced live search while the picker is open and searchable.
    $effect(() => {
        if (!expanded || !searchable) return;
        const t = term;
        let cancelled = false;
        searching = true;
        const timer = setTimeout(() => {
            void find(t).then((res) => {
                if (cancelled) return;
                results = res;
                const merged = { ...names };
                for (const r of res) merged[r.id] = r;
                names = merged;
                searching = false;
            });
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    });

    const suggestions = $derived(results.filter((r) => !selected.includes(r.id)));

    function setAll(all: boolean) {
        selected = all ? [WILDCARD_IDENTIFIER] : [];
    }

    function add(id: string) {
        if (selected.includes(id)) return;
        selected = [...selected.filter((x) => x !== WILDCARD_IDENTIFIER), id];
    }

    function remove(id: string) {
        selected = selected.filter((x) => x !== id);
    }

    const summary = $derived.by(() => {
        if (isAll) return `All ${pluralLabel}`;
        if (specificIds.length === 0) return `No ${pluralLabel} selected`;
        if (specificIds.length <= 2) return specificIds.map((id) => labelFor(id).name).join(', ');
        return `${specificIds.length} ${pluralLabel}`;
    });
</script>

<div class="selector">
    <div class="summary-row">
        <span class="summary" class:empty={isEmpty}>
            {#if isEmpty}
                <Icon icon={IconExclamationCircle} size="s" />
            {/if}
            <span class="summary-text">{summary}</span>
            {#if isDefault}
                <span class="default-tag">Default</span>
            {/if}
        </span>
        <button
            type="button"
            class="toggle"
            class:active={expanded}
            {disabled}
            onclick={() => (expanded = !expanded)}>
            <Icon icon={expanded ? IconCheck : IconPencil} size="s" />
            {expanded ? 'Done' : 'Change'}
        </button>
    </div>

    {#if expanded}
        <div class="body">
            {#if wildcard}
                <div class="mode" role="group">
                    <button
                        type="button"
                        class="seg"
                        class:active={isAll}
                        {disabled}
                        onclick={() => setAll(true)}>All {pluralLabel}</button>
                    <button
                        type="button"
                        class="seg"
                        class:active={!isAll}
                        {disabled}
                        onclick={() => setAll(false)}>Specific {pluralLabel}</button>
                </div>
            {/if}

            {#if specificIds.length > 0}
                <div class="chips">
                    {#each specificIds as id (id)}
                        {@const r = labelFor(id)}
                        <span class="chip">
                            <span class="chip-name" class:mono={!r.resolved}>{r.name}</span>
                            {#if r.region}
                                <Badge size="xs" variant="secondary" content={r.region} />
                            {/if}
                            <button
                                type="button"
                                class="chip-remove"
                                aria-label={`Remove ${r.name}`}
                                {disabled}
                                onclick={() => remove(id)}>×</button>
                        </span>
                    {/each}
                </div>
            {/if}

            {#if searchable}
                <InputSearch
                    bind:value={term}
                    placeholder={`Search ${pluralLabel} by name`}
                    {disabled} />
                <ul class="results">
                    {#if searching}
                        <li class="results-state"><Spinner size="s" /></li>
                    {:else if suggestions.length === 0}
                        <li class="results-state">
                            {term.trim()
                                ? `No matching ${pluralLabel}`
                                : `Type to search ${pluralLabel}`}
                        </li>
                    {:else}
                        {#each suggestions as r (r.id)}
                            <li>
                                <button
                                    type="button"
                                    class="result"
                                    {disabled}
                                    onclick={() => add(r.id)}>
                                    <span class="result-text">
                                        <span class="result-name">{r.name}</span>
                                        {#if r.region}
                                            <Badge
                                                size="xs"
                                                variant="secondary"
                                                content={r.region} />
                                        {/if}
                                    </span>
                                    <Icon icon={IconPlus} size="s" />
                                </button>
                            </li>
                        {/each}
                    {/if}
                </ul>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    .selector {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .summary-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .summary {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--fgcolor-neutral-primary);
    }

    .summary.empty {
        color: var(--fgcolor-warning);
    }

    .summary-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .default-tag {
        flex-shrink: 0;
        padding: 0.05rem 0.4rem;
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-xs, 0.3rem);
        font-size: 0.68rem;
        font-weight: 500;
        color: var(--fgcolor-neutral-tertiary);
    }

    .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 0;
        padding: 0.3rem 0.7rem;
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-s, 0.5rem);
        background: var(--bgcolor-neutral-primary);
        color: var(--fgcolor-neutral-primary);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition:
            background 0.15s ease,
            border-color 0.15s ease;
    }

    .toggle:hover:not(:disabled) {
        background: var(--overlay-neutral-hover, var(--bgcolor-neutral-secondary));
        border-color: var(--border-neutral-strong);
    }

    .toggle.active {
        border-color: var(--border-neutral-strong);
        color: var(--fgcolor-success, var(--fgcolor-neutral-primary));
    }

    .toggle:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .body {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-top: 0.85rem;
        margin-top: 0.1rem;
        border-top: 1px solid var(--border-neutral);
    }

    .mode {
        display: inline-flex;
        gap: 0.25rem;
        padding: 0.2rem;
        border: 1px solid var(--border-neutral);
        border-radius: 0.6rem;
        background: var(--bgcolor-neutral-default);
        align-self: flex-start;
    }

    .seg {
        border: none;
        background: transparent;
        border-radius: 0.45rem;
        padding: 0.35rem 0.75rem;
        font-size: 0.82rem;
        color: var(--fgcolor-neutral-secondary);
        cursor: pointer;
    }

    .seg:hover:not(:disabled):not(.active) {
        color: var(--fgcolor-neutral-primary);
    }

    .seg.active {
        background: var(--bgcolor-neutral-invert);
        color: var(--fgcolor-neutral-on-invert, var(--bgcolor-neutral-primary));
    }

    .seg:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.2rem 0.3rem 0.2rem 0.55rem;
        border: 1px solid var(--border-neutral-strong);
        border-radius: 2rem;
        font-size: 0.8rem;
        max-width: 100%;
    }

    .chip-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--fgcolor-neutral-primary);
    }

    .chip-name.mono {
        font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 0.74rem;
        color: var(--fgcolor-neutral-secondary);
    }

    .chip-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.1rem;
        height: 1.1rem;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--fgcolor-neutral-tertiary);
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
    }

    .chip-remove:hover:not(:disabled) {
        background: var(--bgcolor-neutral-secondary);
        color: var(--fgcolor-neutral-primary);
    }

    .results {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-s, 0.5rem);
        max-height: 12rem;
        overflow-y: auto;
        background: var(--bgcolor-neutral-primary);
    }

    .results-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
        font-size: 0.8rem;
        color: var(--fgcolor-neutral-tertiary);
    }

    .result {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        padding: 0.55rem 0.7rem;
        border: none;
        background: transparent;
        color: var(--fgcolor-neutral-primary);
        cursor: pointer;
        text-align: left;
    }

    .result:hover:not(:disabled) {
        background: var(--overlay-neutral-hover, var(--bgcolor-neutral-secondary));
    }

    .result-text {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
    }

    .result-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
    }

    li:not(.results-state) + li .result {
        border-top: 1px solid var(--border-neutral);
    }
</style>
