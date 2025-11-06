<script lang="ts">
    import {
        Icon,
        Layout,
        Tooltip,
        CompoundTagRoot,
        CompoundTagChild,
        Typography,
        ActionMenu,
        Selector
    } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { queries, tags } from './store';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { parsedTags } from './setFilters';
    import { Button } from '$lib/elements/forms';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import Menu from '$lib/components/menu/menu.svelte';
    import { addFilterAndApply, buildFilterCol, type FilterData } from './quickFilters';
    import QuickFilters from '$lib/components/filters/quickFilters.svelte';

    let {
        columns,
        analyticsSource = ''
    }: { columns: Writable<Column[]> | undefined; analyticsSource?: string } = $props();

    function parseTagParts(tagString: string): { text: string; operator: boolean }[] {
        const parts: { text: string; operator: boolean }[] = [];
        const regex = /\*\*(.*?)\*\*/g;
        let match;
        let lastIndex = 0;
        const matches: Array<{ text: string; index: number; endIndex: number }> = [];

        // find all bold matches
        while ((match = regex.exec(tagString)) !== null) {
            matches.push({
                text: match[1],
                index: match.index,
                endIndex: regex.lastIndex
            });
        }

        // Build parts array
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];

            // Add text before this match (operators, etc.)
            if (lastIndex < currentMatch.index) {
                const beforeText = tagString.substring(lastIndex, currentMatch.index).trim();
                if (beforeText) {
                    parts.push(
                        ...beforeText
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((t) => ({ text: t, operator: true }))
                    );
                }
            }

            // Add the bold text itself
            parts.push({ text: currentMatch.text, operator: false });
            lastIndex = currentMatch.endIndex;
        }

        // Add any remaining text after last match
        if (lastIndex < tagString.length) {
            const remaining = tagString.substring(lastIndex).trim();
            if (remaining) {
                parts.push(
                    ...remaining
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((t) => ({ text: t, operator: true }))
                );
            }
        }

        return parts.filter((p) => Boolean(p.text));
    }

    function firstBoldText(tagString: string): string | null {
        const m = /\*\*(.*?)\*\*/.exec(tagString);
        return m ? m[1] : null;
    }

    function getFilterFor(title: string): FilterData | null {
        if (!columns) return null;
        const col = ($columns as unknown as Column[]).find((c) => c.title === title);
        if (!col) return null;
        const filter = buildFilterCol(col);
        return filter ?? null;
    }
    // Build available filter definitions from provided columns
    let availableFilters = $derived(
        ($columns as unknown as Column[] | undefined)?.length
            ? (($columns as unknown as Column[])
                  .map((c) => (c.filter !== false ? buildFilterCol(c) : null))
                  .filter((f) => f && f.options) as FilterData[])
            : []
    );

    // QuickFilters uses the same filter list
    let filterCols = $derived(availableFilters);

    // Always-show placeholders are derived from available filters (no hardcoding)
    // Use reactive array so runes can track changes
    let hiddenPlaceholders: string[] = $state([]);
    let placeholderVersion = $state(0); // used to force keyed re-render when needed
    let activeTitles = $derived(
        ($parsedTags || []).map((t) => firstBoldText(t.tag)).filter(Boolean) as string[]
    );
    // Compute current placeholders (major filters not already active or dismissed)
    let placeholders = $derived(
        availableFilters
            .filter((f) => !activeTitles.includes(f.title))
            .filter((f) => !hiddenPlaceholders.includes(f.title))
    );
</script>

<Layout.Stack direction="row" gap="s" wrap="wrap" alignItems="center" inline>
    {#if $parsedTags?.length}
        {#each $parsedTags as tag (tag.tag)}
            <span>
                <Tooltip
                    disabled={Array.isArray(tag.value) ? tag.value?.length < 3 : true}
                    maxWidth="600px">
                    <CompoundTagRoot size="s">
                        {@const parts = parseTagParts(tag.tag)}
                        {@const property = firstBoldText(tag.tag)}
                        {#each parts as part}
                            <CompoundTagChild>
                                <Menu>
                                    <span>
                                        {#if part.operator}
                                            <Typography.Text color="--fgcolor-neutral-secondary"
                                                >{part.text}</Typography.Text>
                                        {:else}
                                            {capitalize(part.text)}
                                        {/if}
                                    </span>
                                    <svelte:fragment slot="menu">
                                        {#if property}
                                            {@const filter = getFilterFor(property)}
                                            {#if filter}
                                                {@const isArray = filter?.array}
                                                {@const selectedArray = Array.isArray(tag.value)
                                                    ? tag.value
                                                    : []}
                                                {#each filter.options as option (filter.title + option.value + option.label)}
                                                    <ActionMenu.Root>
                                                        <ActionMenu.Item.Button
                                                            on:click={() => {
                                                                if (isArray) {
                                                                    const exists =
                                                                        selectedArray.includes(
                                                                            option.value
                                                                        );
                                                                    const next = exists
                                                                        ? selectedArray.filter(
                                                                              (v) =>
                                                                                  v !== option.value
                                                                          )
                                                                        : [
                                                                              ...selectedArray,
                                                                              option.value
                                                                          ];
                                                                    addFilterAndApply(
                                                                        filter.id,
                                                                        filter.title,
                                                                        filter.operator,
                                                                        null,
                                                                        next,
                                                                        $columns,
                                                                        ''
                                                                    );
                                                                } else {
                                                                    addFilterAndApply(
                                                                        filter.id,
                                                                        filter.title,
                                                                        filter.operator,
                                                                        option.value,
                                                                        [],
                                                                        $columns,
                                                                        ''
                                                                    );
                                                                }
                                                            }}>
                                                            <Layout.Stack direction="row" gap="s">
                                                                {#if isArray}
                                                                    <Selector.Checkbox
                                                                        checked={selectedArray.includes(
                                                                            option.value
                                                                        )}
                                                                        size="s" />
                                                                {/if}
                                                                {capitalize(option.label)}
                                                            </Layout.Stack>
                                                        </ActionMenu.Item.Button>
                                                    </ActionMenu.Root>
                                                {/each}
                                            {/if}
                                        {/if}
                                    </svelte:fragment>
                                </Menu>
                            </CompoundTagChild>
                        {/each}

                        <CompoundTagChild
                            dismiss
                            on:click={() => {
                                const t = $tags.filter((t) =>
                                    t.tag.includes(tag.tag.split(' ')[0])
                                );
                                t.forEach((t) => (t ? queries.removeFilter(t) : null));
                                queries.apply();
                                parsedTags.update((tags) => tags.filter((t) => t.tag !== tag.tag));
                            }}>
                            <Icon icon={IconX} size="s" />
                        </CompoundTagChild>
                    </CompoundTagRoot>
                    <span slot="tooltip">{tag?.value?.toString()}</span>
                </Tooltip>
            </span>
        {/each}
    {/if}

    <!-- Always render remaining placeholder tags alongside active tags -->
    {#key placeholderVersion}
        {#if placeholders?.length}
            {#each placeholders as filter (filter.title + filter.id)}
                <span>
                    <Menu>
                        <CompoundTagRoot size="s">
                            <CompoundTagChild>
                                <span>{capitalize(filter.title)}</span>
                            </CompoundTagChild>
                            <CompoundTagChild
                                dismiss
                                on:click={(e) => {
                                    e.stopPropagation();
                                    if (!hiddenPlaceholders.includes(filter.title)) {
                                        hiddenPlaceholders.push(filter.title);
                                    }
                                    placeholderVersion++;
                                }}>
                                <Icon icon={IconX} size="s" />
                            </CompoundTagChild>
                        </CompoundTagRoot>
                        <svelte:fragment slot="menu">
                            {#if filter.options}
                                {#each filter.options as option (filter.title + option.value + option.label)}
                                    <ActionMenu.Root>
                                        <ActionMenu.Item.Button
                                            on:click={() => {
                                                addFilterAndApply(
                                                    filter.id,
                                                    filter.title,
                                                    filter.operator,
                                                    filter?.array ? null : option.value,
                                                    filter?.array ? [option.value] : [],
                                                    $columns,
                                                    ''
                                                );
                                            }}>
                                            {capitalize(option.label)}
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                {/each}
                            {/if}
                        </svelte:fragment>
                    </Menu>
                </span>
            {/each}
        {/if}
    {/key}

    {#if filterCols?.length}
        <QuickFilters {columns} {analyticsSource} {filterCols} />
    {/if}

    {#if $parsedTags?.length}
        <Button
            size="s"
            text
            on:click={() => {
                queries.clearAll();
                queries.apply();
                parsedTags.set([]);
            }}>Clear all</Button>
    {/if}
</Layout.Stack>
