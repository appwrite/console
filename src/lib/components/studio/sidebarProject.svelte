<script lang="ts">
    import { Layout, ActionMenu, Icon, Divider } from '@appwrite.io/pink-svelte';
    import {
        IconAnnotation,
        IconCog,
        IconDatabase,
        IconFolder,
        IconSparkles,
        IconTemplate,
        IconUserGroup
    } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import type { ComponentType } from 'svelte';

    export let project;
    export let showChat;
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

<nav style:--icon-fill="var(--fgcolor-neutral-tertiary)" class:isOpen>
    <Layout.Stack direction="column" justifyContent="space-between" height="100%">
        <Layout.Stack gap="xs">
            {#each menuItems as menuItem}
                {#if menuItem.type === 'item'}
                    <ActionMenu.Item.Anchor
                        href={`${base}/project-${project.$id}/${menuItem.path}`}
                        leadingIcon={menuItem.icon}
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
        {#if !$isSmallViewport}
            <ActionMenu.Item.Button
                on:click={() => {
                    showChat = !showChat;
                    if ($isTabletViewport) {
                        isOpen = false;
                    }
                }}>
                <Icon icon={IconSparkles} />
            </ActionMenu.Item.Button>
        {/if}
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
            width: 52px;
        }
    }

    .isOpen {
        transform: translateX(0);
    }
</style>
