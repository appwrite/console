<script lang="ts">
    import { ActionMenu, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Organization } from '$lib/stores/organization';

    let { organization, isOpen = false }: { organization: Organization; isOpen: boolean } =
        $props();

    let menuItems = $derived.by(() => {
        const items = [
            {
                path: `${base}/organization-${organization.$id}`,
                label: 'Projects'
            },
            {
                path: `${base}/organization-${organization.$id}/members`,
                label: 'Members'
            },
            {
                path: `${base}/organization-${organization.$id}/usage`,
                label: 'Usage'
            },
            {
                path: `${base}/organization-${organization.$id}/billing`,
                label: 'Billing'
            },
            {
                path: `${base}/organization-${organization.$id}/settings`,
                label: 'Settings'
            }
        ];
        console.log(page.url.pathname);
        return items.map((item) => {
            return { ...item, isActive: page.url.pathname === item.path };
        });
    });
</script>

<nav class:isOpen>
    <Layout.Stack>
        <Typography.Text color="--fgcolor-neutral-tertiary">{organization.name}</Typography.Text>

        <Layout.Stack gap="xs">
            {#each menuItems as menuItem}
                {#if menuItem.isActive}
                    <ActionMenu.Item.Anchor class="navigation-item-active" href={menuItem.path}
                        >{menuItem.label}</ActionMenu.Item.Anchor>
                {:else}
                    <ActionMenu.Item.Anchor href={menuItem.path}
                        >{menuItem.label}</ActionMenu.Item.Anchor>
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
        width: 200px;
        transform: translateX(-200px);
        height: calc(100vh - 48px);
        padding: var(--space-4) var(--space-8) var(--space-8) var(--space-8);
        transition: transform 0.3s ease-in-out;
        background-color: var(--bgcolor-neutral-default);
        z-index: 10;
    }

    .isOpen {
        transform: translateX(0);
    }

    :global(.navigation-item-active) {
        background-color: var(--overlay-neutral-hover);
    }
</style>
