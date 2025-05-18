<script lang="ts">
    import type { SheetMenu, SubMenu } from '$lib/components/bottom-sheet/index.js';
    import { ActionMenu, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let menu: SubMenu;
    export let isOpen: boolean;
    export let navigateSubMenu: (menu: SheetMenu) => void;
    export let navigatePreviousMenu: () => void;
</script>

{#if menu?.title}
    <span class="menu-title">{menu.title}</span>
{/if}
<ActionMenu.Root>
    {#each menu.items as menuItem}
        {#if menuItem.href}
            <ActionMenu.Item.Anchor
                size="l"
                leadingIcon={menuItem.leadingIcon}
                trailingIcon={menuItem.trailingIcon}
                href={menuItem.href}
                on:click={() => {
                    isOpen = false;
                }}>
                <span class="anchor">{menuItem.name}</span>
            </ActionMenu.Item.Anchor>
        {:else}
            <ActionMenu.Item.Button
                size="l"
                leadingIcon={menuItem.leadingIcon}
                trailingIcon={menuItem.trailingIcon}
                on:click={() => {
                    if (menuItem.subMenu) {
                        navigateSubMenu(menuItem.subMenu);
                    } else if (menuItem.navigatePrevious) {
                        navigatePreviousMenu();
                    } else if (menuItem.onClick !== undefined) {
                        menuItem.onClick();
                        if (menuItem.closeOnClick !== false) {
                            isOpen = false;
                        }
                    }
                }}>
                {#if menuItem?.checked !== undefined}
                    <Layout.Stack direction="row" gap="s">
                        <Selector.Checkbox checked={menuItem.checked} size="s" />
                        {menuItem.name}
                    </Layout.Stack>
                {:else}
                    {menuItem.name}
                {/if}
            </ActionMenu.Item.Button>
        {/if}
    {/each}
</ActionMenu.Root>

<style lang="scss">
    .menu-title {
        padding: var(--space-3) var(--space-5);
        display: block;
        text-transform: uppercase;
        font-size: var(--font-size-xs, 12px);
        line-height: 130%; /* 15.6px */
        letter-spacing: 0.96px;
    }
</style>
