<script lang="ts">
    import { Layout, ActionMenu, Icon, Divider } from '@appwrite.io/pink-svelte';
    import {
        IconAnnotation,
        IconCog,
        IconDatabase,
        IconFolder,
        IconTemplate,
        IconUserGroup
    } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';

    export let project;
</script>

<nav style:--icon-fill="var(--fgcolor-neutral-tertiary)">
    <Layout.Stack gap="xs">
        <ActionMenu.Item.Anchor href={`${base}/project-${project.$id}`} leadingIcon={IconTemplate}
        ></ActionMenu.Item.Anchor>
        <Divider />
        <ActionMenu.Item.Anchor
            href={`${base}/project-${project.$id}/auth`}
            leadingIcon={IconUserGroup}></ActionMenu.Item.Anchor>
        <ActionMenu.Item.Anchor
            href={`${base}/project-${project.$id}/databases`}
            leadingIcon={IconDatabase}></ActionMenu.Item.Anchor>
        <ActionMenu.Item.Anchor
            href={`${base}/project-${project.$id}/messaging`}
            leadingIcon={IconAnnotation}></ActionMenu.Item.Anchor>
        <ActionMenu.Item.Anchor
            href={`${base}/project-${project.$id}/storage`}
            leadingIcon={IconFolder}></ActionMenu.Item.Anchor>
        <Divider />
        <ActionMenu.Item.Anchor
            href={`${base}/project-${project.$id}/settings`}
            leadingIcon={IconCog}></ActionMenu.Item.Anchor>
    </Layout.Stack>
</nav>

<style>
    nav {
        position: fixed;
        left: 0;
        top: 48px;
        height: calc(100vh - 48px);
        padding: var(--space-4);
        width: 52px;
    }
</style>
