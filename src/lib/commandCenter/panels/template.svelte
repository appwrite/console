<script lang="ts">
    import { commandGroupRanks, type Command, type CommandGroup } from '../commands';
    // This is the template for all panels used in the command center.
    // Use this component when you want to create a new panel.

    import { createEventDispatcher, tick } from 'svelte';

    import { getCommandCenterCtx } from '../commandCenter.svelte';

    import { clearSubPanels, popSubPanel, subPanels } from '../subPanels';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Keyboard, Layout } from '@appwrite.io/pink-svelte';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import type { Action } from 'svelte/action';

    /* eslint no-undef: "off" */
    type Option = $$Generic<Omit<Command, 'group'> & { group?: string }>;
    export let options: Option[] | null = null;
    export let search = '';
    export let searchPlaceholder = 'Search...';
    export let fullheight = false;
    export let clearOnCallback = true;

    let selected = 0;
    let usingKeyboard = false;
    let contentEl: HTMLElement;
    let didSearch = false;

    async function triggerOption(option: Option) {
        const prevPanels = $subPanels.length;
        option.callback();
        if (prevPanels === $subPanels.length && clearOnCallback && !option.keepOpen) {
            clearSubPanels();
        }
    }

    const dispatch = createEventDispatcher<{
        keydown: {
            originalEvent: KeyboardEvent;
            cancel: () => void;
            key: string;
        };
    }>();

    function handleKeyDown(event: KeyboardEvent) {
        if (!open) return;
        usingKeyboard = true;

        if (search.length > 0) {
            didSearch = true;
        }

        if (search === '' && didSearch) {
            trackEvent(Submit.SearchClear);
        }

        let canceled = false;
        dispatch('keydown', {
            originalEvent: event,
            cancel: () => (canceled = true),
            key: event.key
        });
        if (canceled) return;

        if (options) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (event.metaKey) {
                    selected = options.length - 1;
                } else {
                    selected = selected === options.length - 1 ? options.length - 1 : selected + 1;
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (event.metaKey) {
                    selected = 0;
                } else {
                    selected = selected === 0 ? 0 : selected - 1;
                }
            } else if (event.key === 'Enter') {
                const option = groupsAndOptions.find(
                    (item) => 'index' in item && item.index === selected
                ) as IndexedOption;
                if (!option) return;
                event.preventDefault();
                triggerOption(option);
            } else if (event.key === 'Home') {
                event.preventDefault();
                selected = 0;
            } else if (event.key === 'End') {
                event.preventDefault();
                selected = options.length - 1;
            }

            tick().then(() => {
                if (!cardEl) return;

                const selectedEl = contentEl.querySelector('[data-selected]');

                if (selectedEl) {
                    selectedEl.scrollIntoView({
                        block: 'nearest'
                    });
                }
            });
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            popSubPanel();
        }
    }

    $: if (selected > options?.length - 1) {
        selected = options?.length - 1;
    } else if (usingKeyboard && selected < 0 && options?.length) {
        selected = 0;
    }

    const commandCenterCtx = getCommandCenterCtx();

    let cardEl: HTMLElement;

    type Group = { type: 'group'; name: string };
    type IndexedOption = Option & { index: number };
    function isGroup(item: Option | Group): item is Group {
        return !!item && 'type' in item && item.type === 'group';
    }
    const getGroupsAndOptions = (options: Option[]) => {
        if (!options) return null;

        const groupedOptions = new Map<string, Option[]>();
        groupedOptions.set('ungrouped', []);

        for (const option of options) {
            if (!option.group) {
                groupedOptions.set('ungrouped', [...groupedOptions.get('ungrouped'), option]);
            } else {
                groupedOptions.set(option.group, [
                    ...(groupedOptions.get(option.group) || []),
                    option
                ]);
            }
        }

        // Organize groups
        const sortedOptions = [...groupedOptions.entries()]
            .sort(([a], [b]) => {
                const aRank = $commandGroupRanks[a] || 0;
                const bRank = $commandGroupRanks[b] || 0;
                if (aRank < bRank) {
                    return 1;
                } else if (aRank > bRank) {
                    return -1;
                } else {
                    return 0;
                }
            })
            .map(([groupName, options]) => {
                return [
                    groupName,
                    options.sort((a, b) => {
                        const aRank = a.rank || 0;
                        const bRank = b.rank || 0;
                        if (aRank < bRank) {
                            return 1;
                        } else if (aRank > bRank) {
                            return -1;
                        } else {
                            return 0;
                        }
                    })
                ] as [CommandGroup, Option[]];
            });

        // return a flat array of groups and indexed options
        let optionIndex = 0;
        const groupsAndOptions: (Group | IndexedOption)[] = [];
        for (const [groupName, options] of sortedOptions) {
            if (groupName !== 'ungrouped') {
                groupsAndOptions.push({ type: 'group', name: groupName });
            }

            for (const option of options) {
                groupsAndOptions.push({ ...option, index: optionIndex++ });
            }
        }

        return groupsAndOptions;
    };

    $: groupsAndOptions = getGroupsAndOptions(options);

    const getOptionClickHandler = (option: IndexedOption) => () => {
        triggerOption(option);
    };

    const getOptionFocusHandler =
        (option: IndexedOption, hover = false) =>
        () => {
            selected = option.index;
            usingKeyboard = hover ? false : usingKeyboard;
        };

    const getOptionBlurHandler = () => () => {
        selected = -1;
        usingKeyboard = false;
    };

    const castOption = (option: IndexedOption) => option as Option;

    function getBreadcrumbs(subPanels: typeof $subPanels) {
        return subPanels.filter((panel) => panel.name !== 'root').map((panel) => panel.name);
    }

    let breadcrumbs = getBreadcrumbs($subPanels);

    // Avoid clearing subpanels before the closing transition is finished
    $: if ($subPanels.length) {
        breadcrumbs = getBreadcrumbs($subPanels);
    }

    const handleCrumbClick = (index: number) => {
        if (index === breadcrumbs.length - 1) {
            popSubPanel();
        } else {
            const numCrumbsToPop = breadcrumbs.length - index - 1;
            for (let i = 0; i < numCrumbsToPop; i++) {
                popSubPanel();
            }
        }
    };

    const isFirstNested = (index: number) => {
        const prevItem = groupsAndOptions[index - 1];
        const item = groupsAndOptions[index];
        if (isGroup(item)) return false;
        if (!item.nested) return false;

        return !isGroup(prevItem) && !prevItem?.nested;
    };

    const isLastNested = (index: number) => {
        const nextItem = groupsAndOptions[index + 1];
        const item = groupsAndOptions[index];
        if (isGroup(item)) return false;
        if (!item.nested) return false;

        return isGroup(nextItem) || !nextItem?.nested;
    };

    const autofocus: Action<HTMLInputElement> = (node) => {
        if (node) node.focus();
    };
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
    class="card"
    class:fullheight
    bind:this={cardEl}
    class:press={!$commandCenterCtx.isInitialPanel}
    class:scale-up={$commandCenterCtx.isInitialPanel && $commandCenterCtx.open}>
    <div class="search-wrapper">
        {#each breadcrumbs as crumb, i}
            {@const isLast = i === breadcrumbs.length - 1}
            <button class="crumb" on:click={() => handleCrumbClick(i)}>
                <span>{crumb}</span>
                <i class="icon-x"></i>
            </button>
            {#if !isLast}
                <span style="opacity: 50%">/</span>
            {/if}
        {/each}

        <slot name="search">
            <div class="u-flex default-search u-width-full-line">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    use:autofocus
                    bind:value={search} />
            </div>
        </slot>
    </div>

    <div class="content" bind:this={contentEl}>
        <slot />
        {#if groupsAndOptions}
            <ul class="options">
                {#each groupsAndOptions as item, i}
                    {@const isSelected = !isGroup(item) && item.index === selected}

                    {#if isGroup(item)}
                        <li class="group eyebrow-heading-3">
                            {item.name}
                        </li>
                    {:else}
                        <li
                            class="result"
                            data-selected={isSelected ? true : undefined}
                            class:nested={item.nested}
                            class:first-nested={isFirstNested(i)}
                            class:last-nested={isLastNested(i)}>
                            {#if isSelected}
                                <div class="bg"></div>
                            {/if}
                            <button
                                class="option"
                                on:click={getOptionClickHandler(item)}
                                on:mouseover={getOptionFocusHandler(item, true)}
                                on:mouseleave={getOptionBlurHandler()}
                                on:focus={getOptionFocusHandler(item)}>
                                <slot name="option" option={castOption(item)}>
                                    <Layout.Stack direction="row" gap="s" alignItems="center">
                                        {#if item.icon}
                                            <Icon
                                                icon={item.icon}
                                                size="s"
                                                color="--fgcolor-neutral-tertiary" />
                                        {:else}
                                            <Icon
                                                icon={IconArrowSmRight}
                                                size="s"
                                                color="--fgcolor-neutral-tertiary" />
                                        {/if}
                                        <span>
                                            {item.label}
                                        </span>
                                    </Layout.Stack>
                                </slot>
                            </button>
                        </li>
                    {/if}
                {:else}
                    <li class="result">
                        <slot name="no-options">
                            <span class="text">No options found</span>
                        </slot>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>

    <div class="footer">
        <slot name="footer">
            <Layout.Stack direction="row" justifyContent="space-between"
                ><Layout.Stack direction="row" alignItems="center" gap="xxs">
                    <Keyboard key="Enter" autoWidth={true} /> <span>to select</span></Layout.Stack>
                <Layout.Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap="xxs">
                    <Keyboard key="Esc" autoWidth={true} />
                    <span>to {$subPanels.length > 1 ? 'go back' : 'close'}</span></Layout.Stack>
            </Layout.Stack>
        </slot>
    </div>
</div>

<style lang="scss">
    // Animations
    @keyframes press {
        0% {
            scale: 1;
        }

        30% {
            scale: 0.985;
        }

        100% {
            scale: 1;
        }
    }

    .press {
        animation: press 250ms ease;
    }

    @keyframes scale-up {
        0% {
            scale: 0.95;
        }

        100% {
            scale: 1;
        }
    }

    .scale-up {
        animation: scale-up 150ms cubic-bezier(0.5, 1, 0.89, 1);
    }

    .card {
        --cmd-center-bg: var(--bgcolor-neutral-primary);
        --footer-bg: var(--bgcolor-neutral-primary);
        --cmd-center-border: var(--border-neutral);
        --result-bg: var(--overlay-neutral-hover);
        --kbd-bg: var(--overlay-on-neutral);
        --kbd-color: var(--fgcolor-neutral-secondary);
        --icon-color: var(--fgcolor-neutral-tertiary);
        --label-color: var(--fgcolor-neutral-secondary);
        --crumb-color: var(--fgcolor-neutral-secondary);
    }

    // Elements
    .card {
        position: absolute;
        --top: clamp(64px, 10vh, 400px);
        top: var(--top);
        left: 50%;
        translate: -50%;

        display: flex;
        flex-direction: column;
        width: var(--width, 42.5rem);
        max-width: 100%;
        min-height: var(--min-height);
        max-height: min(calc(100vh - var(--top) - 4rem), var(--max-height, 32rem));
        overflow: hidden;
        padding: 0;
        box-shadow:
            0 56px 32px 0 rgba(0, 0, 0, 0.02),
            0 6px 14px 0 rgba(0, 0, 0, 0.04),
            0 24px 25px 0 rgba(0, 0, 0, 0.03);

        border-radius: 0.5rem;
        border: 1px solid var(--cmd-center-border);
        background: var(--cmd-center-bg);
        backdrop-filter: blur(6px);

        &.fullheight {
            height: var(--max-height, 32rem);
        }

        :global(.kbd) {
            color: var(--kbd-color);
            background-color: var(--kbd-bg);
            padding-inline: var(--space-2, 4px);
        }
    }

    .search-wrapper {
        display: flex;
        gap: 0.25rem;
        align-items: center;
        width: 100%;

        border-bottom: 1px solid var(--border-neutral, #ededf0);
        font-size: 16px;
        padding: 1rem;

        .default-search {
            input {
                width: 100%;
                margin: 0rem;
                padding: 0rem;
                border: none;
                background-color: transparent;
            }
        }
    }

    .crumb {
        display: flex;
        padding: 0.09375rem 0.25rem;
        align-items: center;
        gap: 0.25rem;

        border-radius: 0.25rem;
        color: var(--crumb-color);
        text-align: center;
        font-family: Inter;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: normal;

        white-space: nowrap;

        &:hover {
            opacity: 0.75;
        }

        i {
            font-size: 10px;
        }
    }

    .content {
        overflow-y: auto;
        flex-grow: 1;

        .options {
            padding: 1rem;

            .group {
                color: var(--fgcolor-neutral-secondary, #56565c);
                margin-inline-start: 0.25rem;
                margin-block-end: 0.25rem;
                position: relative;
                z-index: 10;

                font-size: var(--font-size-xs, 12px);
                font-weight: 500;

                &:not(:first-child) {
                    margin-block-start: 1rem;
                }
            }

            .result {
                position: relative;
                scroll-margin-block: 0.5rem;

                .bg {
                    position: absolute;
                    inset: 0;
                    background-color: var(--result-bg);
                    border-radius: 0.5rem;
                    translate: 0 -1px;
                }

                .option {
                    padding: 0.5rem 9.5px;
                    font-size: 14px;
                    position: relative;
                    z-index: 10;
                    width: 100%;

                    box-shadow: none !important;

                    color: var(--label-color);

                    :global(i[class^='icon-']) {
                        font-size: 1rem !important;
                        width: 1rem !important;
                        height: 1rem !important;
                        color: var(--icon-color);
                        position: relative;
                    }

                    :global(i[class^='icon-']::before) {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        translate: -50% -50%;
                    }
                }

                &.nested {
                    margin-left: 30px;

                    &.first-nested::before {
                        top: 8px;
                    }

                    &.last-nested::before {
                        height: calc(100% - 8px);
                    }

                    &::before {
                        content: '';
                        position: absolute;
                        left: -8px;
                        border-left: 1px solid var(--border-neutral, #ededf0);
                        height: 100%;
                    }
                }
            }
        }
    }

    .footer {
        background: var(--footer-bg);
        border-top: 1px solid var(--border-neutral, #ededf0);

        padding: 0.75rem 1rem;
    }
</style>
