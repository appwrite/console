<script lang="ts">
    import { createContextMenu, melt } from '@melt-ui/svelte';
    import { Card, ActionMenu, Divider } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';
    import {
        IconPencil,
        IconDuplicate,
        IconKey,
        IconChartBar,
        IconLink,
        IconTrash,
        IconClipboardCopy,
        IconCode,
        IconChevronRight
    } from '@appwrite.io/pink-icons-svelte';
    import type { RowCellAction } from './sheetOptions.svelte';
    import { trackEvent, Click } from '$lib/actions/analytics';

    export let onSelect: (action: RowCellAction) => void;

    const {
        elements: { menu, trigger, item, separator },
        builders: { createSubmenu }
    } = createContextMenu({
        positioning: {
            placement: 'right-start',
            gutter: 2,
            sameWidth: false
        },
        onOpenChange: ({ next }) => {
            if (next) {
                trackEvent(Click.RowContextMenuOpen);
            }
            return next;
        }
    });

    const {
        elements: { subMenu: copySubMenu, subTrigger: copySubTrigger }
    } = createSubmenu({
        positioning: {
            placement: 'right-start',
            gutter: 8
        },
        arrowSize: 0
    });

    const menuItems: {
        label?: string;
        icon?: ComponentType;
        action?: RowCellAction;
        subMenu?: string;
        divider?: boolean;
        danger?: boolean;
    }[] = [
        { label: 'Update row', icon: IconPencil, action: 'update' },
        { label: 'Duplicate row', icon: IconDuplicate, action: 'duplicate-row' },
        { divider: true },
        { label: 'Manage permissions', icon: IconKey, action: 'permissions' },
        { label: 'View activity', icon: IconChartBar, action: 'activity' },
        { divider: true },
        { label: 'Copy', icon: IconDuplicate, subMenu: 'copy' },
        { divider: true },
        { label: 'Delete', icon: IconTrash, action: 'delete', danger: true }
    ];

    const copyMenuItems: { label: string; icon: ComponentType; action: RowCellAction }[] = [
        { label: 'URL', icon: IconLink, action: 'copy-url' },
        { label: 'JSON', icon: IconClipboardCopy, action: 'copy-json' },
        { label: 'Code snippet', icon: IconCode, action: 'copy-snippet' }
    ];
</script>

<div use:melt={$trigger} style="display: contents;">
    <slot />
</div>

<div class="menu" use:melt={$menu}>
    <Card.Base padding="none">
        <div class="action-menu-root">
            <ActionMenu.Root>
                {#each menuItems as menuItem, index}
                    {#if menuItem.divider}
                        {@const isLastDivider = index === menuItems.length - 2}
                        <div
                            use:melt={$separator}
                            style:margin-inline="-1rem"
                            style:padding-block-start="0.5rem"
                            style:padding-block-end={isLastDivider ? '0.25rem' : '0.5rem'}>
                            <Divider />
                        </div>
                    {:else if menuItem.subMenu === 'copy'}
                        <!-- Copy Submenu Trigger -->
                        <div use:melt={$copySubTrigger} class="sub-trigger">
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button
                                    leadingIcon={menuItem.icon}
                                    trailingIcon={IconChevronRight}>
                                    {menuItem.label}
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </div>
                    {:else}
                        <div
                            use:melt={$item}
                            style:display="contents"
                            on:m-click={() => onSelect(menuItem.action as RowCellAction)}>
                            <ActionMenu.Item.Button
                                leadingIcon={menuItem.icon}
                                status={menuItem.danger ? 'danger' : undefined}>
                                {menuItem.label}
                            </ActionMenu.Item.Button>
                        </div>
                    {/if}
                {/each}
            </ActionMenu.Root>
        </div>

        <!-- Copy Submenu (outside ActionMenu.Root, inside Card.Base) -->
        <div class="menu submenu" use:melt={$copySubMenu}>
            <Card.Base padding="none">
                <div class="action-menu-root">
                    {#each copyMenuItems as copyItem}
                        <div use:melt={$item} on:m-click={() => onSelect(copyItem.action)}>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button leadingIcon={copyItem.icon}>
                                    {copyItem.label}
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </div>
                    {/each}
                </div>
            </Card.Base>
        </div>
    </Card.Base>
</div>

<style>
    .menu {
        z-index: 50;
        min-width: 220px;
        outline: none;
        border-radius: var(--border-radius-m);
        box-shadow: var(--shadow-large);
    }

    .submenu {
        margin-inline: -4px;
        margin-block: -4px;
    }

    .action-menu-root {
        margin-inline-start: calc(var(--space-2) * -1);

        & :global(:first-child) {
            overflow: visible;
        }
    }
</style>
