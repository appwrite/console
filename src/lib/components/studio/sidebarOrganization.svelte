<script lang="ts">
    import { ActionMenu, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import type { Organization } from '$lib/stores/organization';

    export let organization: Organization;
</script>

<nav>
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

<style>
    nav {
        position: fixed;
        left: 0;
        top: 48px;
        width: 200px;
        height: calc(100vh - 48px);
        padding: var(--space-4) var(--space-8) var(--space-8) var(--space-8);
    }
</style>
