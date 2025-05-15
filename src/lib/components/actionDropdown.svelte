<script lang="ts">
    import { createMenubar, melt } from '@melt-ui/svelte';
    import { Icon, ActionMenu, Card } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconSearch } from '@appwrite.io/pink-icons-svelte';
    import { BottomSheet } from '$lib/components';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import type { SubMenu } from '$lib/components/bottom-sheet';
    import type { ComponentType } from 'svelte';
    import { InputText } from '$lib/elements/forms/index.js';

    type Item = {
        name: string;
        isActive: boolean;
        onClick?: () => void;
        href?: string;
        icon?: ComponentType;
        type: 'item';
    };

    type MenuOption =
        | Item
        | {
              type: 'divider';
          };

    const {
        elements: { menubar },
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { trigger: triggerItems, menu: menuItems }
    } = createMenu();

    let { items = [], hasSearch = false }: { items: MenuOption[]; hasSearch: boolean } = $props();

    const selectedItem = $derived.by(() => {
        return items.find((item) => item.type !== 'divider' && item.isActive) as Item;
    });

    let searchedItems = $derived.by(() => {
        return items.filter((item) => item.type === 'divider' || item.name.includes(searchValue));
    });

    let bottomSheetOpen = $state(false);

    const bottomSheetOptions: SubMenu = $derived.by(() => {
        return {
            top: {
                items: items
                    .filter((item) => item.type !== 'divider')
                    .map((item) => ({
                        name: item.name,
                        href: item.href,
                        onClick: item.onClick,
                        leadingIcon: item.icon
                    }))
            },
            bottom: undefined
        };
    });

    function onResize() {
        if (bottomSheetOpen && !$isSmallViewport) {
            bottomSheetOpen = false;
        }
    }

    let searchValue = $state('');
    let pointerEventsSet = false;

    $effect(() => {
        if ($previewFrameRef) {
            if ($triggerItems['data-state'] === 'open' && !pointerEventsSet) {
                $previewFrameRef.style.pointerEvents = 'none';
                pointerEventsSet = true;
            } else if ($triggerItems['data-state'] === 'closed' && pointerEventsSet) {
                pointerEventsSet = false;
                $previewFrameRef.style.pointerEvents = '';
            }
        }
    });
</script>

<svelte:window on:resize={onResize} />
<div use:melt={$menubar} data-align="center">
    {#if !$isSmallViewport}
        <button
            type="button"
            class="trigger-wrapper"
            use:melt={$triggerItems}
            aria-label="Open tab">
            <div class="trigger-content">
                <span class="orgName">{selectedItem?.name ?? 'Artifact'}</span>
                <Icon icon={IconChevronDown} size="s" color="--fgcolor-neutral-secondary" />
            </div>
        </button>
    {:else}
        <button
            type="button"
            class="trigger-wrapper"
            onclick={() => {
                bottomSheetOpen = true;
            }}
            aria-label="Open tab">
            <span class="orgName" class:noProjects={!selectedItem}>
                {selectedItem?.name ?? 'Artifact'}
            </span>
            <Icon icon={IconChevronDown} size="s" color="--fgcolor-neutral-secondary" />
        </button>
    {/if}

    <div class="menu" use:melt={$menuItems} class:action-dropdown-search={hasSearch}>
        <Card.Base padding="xxxs" shadow={true}>
            {#if hasSearch}
                <div class="search-header">
                    <InputText placeholder="Search" id="search" bind:value={searchValue}>
                        <Icon slot="start" icon={IconSearch} />
                    </InputText>
                </div>
                <div class="search-spacer"></div>
            {/if}
            {#each searchedItems as item}
                {#if item.type === 'divider'}
                    <div class="divider"></div>
                {:else}
                    <div use:melt={$triggerItems}>
                        <ActionMenu.Root>
                            {#if item.href}
                                <ActionMenu.Item.Anchor href={item.href}
                                    >{item.name}</ActionMenu.Item.Anchor>
                            {:else if item.onClick}
                                <ActionMenu.Item.Button
                                    on:click={item.onClick}
                                    leadingIcon={item.icon}>{item.name}</ActionMenu.Item.Button>
                            {/if}</ActionMenu.Root>
                    </div>
                {/if}
            {/each}
        </Card.Base>
    </div>
</div>
<BottomSheet.Menu bind:isOpen={bottomSheetOpen} menu={bottomSheetOptions}></BottomSheet.Menu>

<style lang="scss">
    .menu {
        min-width: 244px;
        z-index: 20;
    }

    .search-header {
        position: fixed;
        width: 234px;
    }

    .action-dropdown-search {
        max-height: 400px;
    }
    .search-spacer {
        height: var(--base-36);
    }

    :global(.action-dropdown-search > div) {
        max-height: inherit;
        overflow-y: scroll;
        scrollbar-width: none;
    }

    .trigger-content {
        display: flex;
        align-items: center;
        gap: var(--gap-s);
        padding-inline: var(--space-4);
        padding-block: var(--space-2);
        border-radius: var(--border-radius-xs);
        flex-direction: row;

        &:hover {
            background: var(--overlay-neutral-hover, rgba(25, 25, 28, 0.03));
        }
    }

    .not-mobile {
        display: none;

        @media (min-width: 768px) {
            display: block;
        }
    }

    .subMenu {
        min-width: 244px;
        margin-inline: -4px;
        margin-block: -4px;
    }

    .orgName,
    .projectName {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--fgcolor-neutral-secondary);

        @media (min-width: 390px) {
            max-width: 95px;
        }

        @media (min-width: 400px) {
            max-width: 105px;
        }

        @media (min-width: 800px) {
            max-width: 125px;
        }

        @media (min-width: 1024px) {
            max-width: 150px;
        }
    }

    .noProjects {
        max-width: 150px;
    }

    .trigger-wrapper {
        min-width: 244px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1, 2px) var(--space-2, 4px) var(--space-1, 2px) var(--space-3, 6px);
        gap: var(--space-2, 4px);
        margin: 0 var(--space-5, 10px) 0 var(--space-5, 10px);

        transition: color 0.2s ease;

        color: var(--fgcolor-neutral-primary, #2d2d31);
        border-radius: var(--corner-radius-medium, 8px);

        cursor: pointer;
        /* Body text/level 2 Regular */
        font-family: Inter;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 21px */
    }

    .trigger:focus-visible {
        z-index: 30;
        box-shadow:
            var(--shadow-offsetx-0, 0px) var(--shadow-offsety-0, 0px) 0 2px
                var(--bgcolor-neutral-default, #fafafb),
            0 0 0 4px var(--border-focus, #818186);
    }
    .divider {
        height: 1px;
        margin-block: 2px;
        margin-inline-start: calc(var(--base-4) * -1);
        width: calc(100% + var(--base-8));
        background-color: var(--border-neutral);
    }
</style>
