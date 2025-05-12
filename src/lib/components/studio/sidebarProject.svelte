<script lang="ts">
    import { Layout, ActionMenu, Icon, Divider } from '@appwrite.io/pink-svelte';
    import {
        IconAnnotation,
        IconCog,
        IconDatabase,
        IconFolder,
        IconSparkles,
        IconTemplate,
        IconUserGroup,
        IconViewGrid
    } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import type { ComponentType } from 'svelte';
    import { page } from '$app/state';

    export let project;
    export let isOpen;

    const menuItems: Array<
        { type: 'divider' } | { type: 'item'; label: string; path: string; icon: ComponentType }
    > = [
        { type: 'item', label: 'Studio', path: 'studio', icon: IconTemplate },
        { type: 'divider' },
        { type: 'item', label: 'Auth', path: 'auth', icon: IconUserGroup },
        { type: 'item', label: 'Databases', path: 'databases', icon: IconDatabase },
        { type: 'item', label: 'Messaging', path: 'messaging', icon: IconAnnotation },
        { type: 'item', label: 'Storage', path: 'storage', icon: IconFolder },
        { type: 'divider' },
        { type: 'item', label: 'Settings', path: 'settings', icon: IconCog }
    ];
</script>

<nav style:--icon-fill="var(--fgcolor-neutral-tertiary)" class="project-sidebar" class:isOpen>
    <Layout.Stack direction="column" justifyContent="space-between" height="100%">
        <Layout.Stack gap="s" inline>
            {#each menuItems as menuItem}
                {#if menuItem.type === 'item'}
                    {@const isActive = page.url.pathname.includes(menuItem.path)}
                    <ActionMenu.Item.Anchor
                        style={`--space-5: 8px; background-color: ${
                            isActive ? 'var(--overlay-neutral-hover)' : 'auto'
                        }; --icon-fill: ${isActive ? 'var(--fgcolor-neutral-primary)' : 'var(--fgcolor-neutral-tertiary)'}`}
                        href={`${base}/project-${project.$id}/${menuItem.path}`}
                        leadingIcon={menuItem.icon}
                        size="l"
                        on:click={() => {
                            if ($isSmallViewport) {
                                isOpen = false;
                            }
                        }}
                        >{#if $isSmallViewport}{menuItem.label}{/if}</ActionMenu.Item.Anchor>
                {:else if menuItem.type === 'divider'}
                    <Divider />
                {/if}
            {/each}
        </Layout.Stack>
    </Layout.Stack>
</nav>

<style>
    nav {
        position: fixed;
        left: 0;
        top: 48px;
        height: calc(100vh - 48px);
        padding: var(--space-4);
        width: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
        background-color: var(--bgcolor-neutral-default);
        z-index: 10;

        @media (min-width: 768px) {
            padding-block-start: 16px;
            width: 48px;
        }
    }

    .isOpen {
        transform: translateX(0);
    }
</style>
