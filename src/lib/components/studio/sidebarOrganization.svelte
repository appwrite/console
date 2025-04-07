<script lang="ts">
    import { ActionMenu, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import type { Organization } from '$lib/stores/organization';
    import { isTabletViewport, isSmallViewport } from '$lib/stores/viewport';

    export let organization: Organization;
    export let isOpen = !($isTabletViewport || $isSmallViewport);
</script>

<nav class:isOpen>
    <Layout.Stack>
        <Typography.Text color="--fgcolor-neutral-tertiary">{organization.name}</Typography.Text>

        <Layout.Stack gap="xs">
            <ActionMenu.Item.Anchor href={`${base}/organization-${organization.$id}`}
                >Projects</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor href={`${base}/organization-${organization.$id}/members`}
                >Members</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor href={`${base}/organization-${organization.$id}/usage`}
                >Usage</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor href={`${base}/organization-${organization.$id}/billing`}
                >Billing</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor href={`${base}/organization-${organization.$id}/settings`}
                >Settings</ActionMenu.Item.Anchor>
        </Layout.Stack>
    </Layout.Stack>
</nav>

<button
    type="button"
    class="overlay-button"
    aria-label="Close sidebar"
    class:overlay={isOpen}
    on:click={() => {
        isOpen = false;
    }}></button>

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

    .overlay {
        background-color: rgba(0, 0, 0, 0.4);
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: #56565c1a;
        backdrop-filter: blur(5px);
        transition:
            backdrop-filter 0.5s ease-in-out,
            background-color 0.35s ease-in-out;
        z-index: 1;
        margin-top: 0 !important;
    }

    .overlay-button {
        margin-top: calc(-1 * var(--space-6));
        @media (min-width: 1024px) {
            display: none;
        }
    }
</style>
