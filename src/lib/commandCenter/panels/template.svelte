<script lang="ts">
    import type { CommandGroup } from '../commands';

    // This is the template for all panels used in the command center.
    // Use this component when you want to create a new panel.

    import { tick } from 'svelte';

    import { getCommandCenterCtx } from '../commandCenter.svelte';

    import { clearSubPanels, popSubPanel, subPanels } from '../subPanels';

    import { quadOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';
    import Breadcrumbs from '$lib/layout/breadcrumbs.svelte';

    type BaseOption = { callback: () => void; group?: CommandGroup };
    type Option = $$Generic<BaseOption>;
    export let options: Option[] | null = null;
    export let search = '';

    let selected = 0;

    function triggerOption(option: Option) {
        const prevPanels = $subPanels.length;
        option.callback();
        if (prevPanels === $subPanels.length) {
            clearSubPanels();
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (!open) return;

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
            } else if (event.key === 'Enter' && options[selected]) {
                event.preventDefault();
                triggerOption(options[selected]);
            } else if (event.key === 'Home') {
                event.preventDefault();
                selected = 0;
            } else if (event.key === 'End') {
                event.preventDefault();
                selected = options.length - 1;
            }

            tick().then(() => {
                if (!cardEl) return;
                const selectedEl = cardEl.querySelector('[data-selected]');

                if (selectedEl) {
                    selectedEl.scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth'
                    });
                }
            });
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            popSubPanel();
        }
    }

    $: {
        options;
        selected = 0;
    }

    const [send, receive] = crossfade({
        duration: 150,
        easing: quadOut
    });

    const commandCenterCtx = getCommandCenterCtx();

    let cardEl: HTMLElement;

    type Group = { type: 'group'; name: string };
    type IndexedOption = Option & { index: number };
    function isGroup(item: Option | Group): item is Group {
        return 'type' in item && item.type === 'group';
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

        // return a flat array of groups and indexed options
        let optionIndex = 0;
        const groupsAndOptions: (Group | IndexedOption)[] = [];
        for (const [groupName, options] of groupedOptions) {
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

    const getOptionFocusHandler = (option: IndexedOption) => () => {
        selected = option.index;
    };

    const castOption = (option: IndexedOption) => option as Option;

    $: breadcrumbs = $subPanels.slice(1).map((panel) => panel.name);

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
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
    class="card"
    bind:this={cardEl}
    class:press={!$commandCenterCtx.isInitialPanel}
    class:scale-up={$commandCenterCtx.isInitialPanel && $commandCenterCtx.open}>
    <div class="u-flex u-flex-vertical u-width-full-line u-overflow-hidden">
        <div class="u-flex u-gap-4 u-cross-center u-width-full-line">
            {#each breadcrumbs as crumb, i}
                <button class="crumb" on:click={() => handleCrumbClick(i)}>{crumb}</button>
            {/each}

            <slot name="search">
                <div class="u-flex search-wrapper u-width-full-line">
                    <input
                        type="text"
                        placeholder="Search for commands..."
                        autofocus
                        bind:value={search} />
                </div>
            </slot>
        </div>

        {#if groupsAndOptions}
            <ul class="options u-margin-block-start-16 u-flex u-flex-vertical u-gap-8">
                {#each groupsAndOptions as item}
                    {@const isSelected = !isGroup(item) && item.index === selected}
                    {#if isGroup(item)}
                        <li class="group eyebrow-heading-3">
                            {item.name}
                        </li>
                    {:else}
                        <li class="result" data-selected={isSelected ? true : undefined}>
                            {#if isSelected}
                                <div
                                    class="bg"
                                    in:send|local={{ key: 'bg' }}
                                    out:receive|local={{ key: 'bg' }} />
                            {/if}
                            <button
                                class="option"
                                on:click={getOptionClickHandler(item)}
                                on:mouseover={getOptionFocusHandler(item)}
                                on:focus={getOptionFocusHandler(item)}>
                                <slot name="option" option={castOption(item)} />
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
        {:else}
            <slot />
        {/if}
    </div>
    <div class="footer">
        <slot name="footer" />
    </div>
</div>

<style lang="scss">
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
        display: flex;
        flex-direction: column;
        width: var(--command-panel-width, 680px);
        max-width: 100%;
        max-height: 450px;
        overflow: hidden;
        padding: 0.5rem;

        position: absolute;
        top: clamp(128px, 15vh, 400px);
        left: 50%;
        translate: -50%;

        border-radius: 0.5rem;
        border: 1px solid var(--dark-neutrals-150, #373b4d);
        background: rgba(27, 27, 40, 0.8);
        box-shadow: 0px 16px 32px 0px #14141f;
        backdrop-filter: blur(6px);
    }

    .search-wrapper {
        border-bottom: 1px solid hsl(var(--color-border));
        font-size: 16px;
    }

    .options {
        overflow-y: auto;
        height: 100%;
        flex-shrink: 1;
    }

    input {
        border: none;
        background-color: transparent;
    }

    .group {
        color: hsl(var(--color-neutral-70));
        margin-inline-start: 0.25rem;
        position: relative;
        z-index: 10;
    }

    .result {
        transition: 150ms;
        position: relative;

        opacity: 0.65;
        transition: 75ms cubic-bezier(0.5, 1, 0.89, 1);
        &[data-selected] {
            opacity: 1;
            transition: 150ms cubic-bezier(0.5, 1, 0.89, 1);
        }

        .bg {
            position: absolute;
            inset: 0;
            background-color: hsl(var(--color-neutral-200));
            border-radius: 0.75rem;
            translate: 0 -1px;
        }

        .option {
            padding: 0.5rem 0.75rem;
            position: relative;
            z-index: 10;
            width: 100%;

            box-shadow: none !important;
        }
    }

    .footer {
        background: linear-gradient(180deg, #1b1b28 0%, #282a3b 100%);
        margin: -0.5rem;
        padding: 0.5rem;
    }

    .crumb {
        display: flex;
        padding: 0.09375rem 0.25rem;
        align-items: center;
        gap: 0.125rem;

        border-radius: 0.25rem;
        background: var(--dark-neutrals-150, #373b4d);

        color: var(--light-neutrals-30, #e8e9f0);
        text-align: center;
        font-family: Inter;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
</style>
