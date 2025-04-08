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
    import { isSmallViewport } from '$lib/stores/viewport';

    export let project;
    export let showChat;
    export let isOpen;
</script>

<nav style:--icon-fill="var(--fgcolor-neutral-tertiary)" class:isOpen>
    <Layout.Stack direction="column" justifyContent="space-between" height="100%">
        <Layout.Stack gap="xs">
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}`}
                leadingIcon={IconTemplate}
                on:click={() => {
                    isOpen = false;
                }}
                >{#if $isSmallViewport}Studio{/if}</ActionMenu.Item.Anchor>
            <Divider />
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}/auth`}
                leadingIcon={IconUserGroup}
                on:click={() => {
                    isOpen = false;
                }}
                >{#if $isSmallViewport}Auth{/if}</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}/databases`}
                on:click={() => {
                    isOpen = false;
                }}
                leadingIcon={IconDatabase}
                >{#if $isSmallViewport}Databases{/if}</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}/messaging`}
                on:click={() => {
                    isOpen = false;
                }}
                leadingIcon={IconAnnotation}
                >{#if $isSmallViewport}Messaging{/if}</ActionMenu.Item.Anchor>
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}/storage`}
                on:click={() => {
                    isOpen = false;
                }}
                leadingIcon={IconFolder}
                >{#if $isSmallViewport}Storage{/if}</ActionMenu.Item.Anchor>
            <Divider />
            <ActionMenu.Item.Anchor
                href={`${base}/project-${project.$id}/settings`}
                on:click={() => {
                    isOpen = false;
                }}
                leadingIcon={IconCog}
                >{#if $isSmallViewport}Settings{/if}</ActionMenu.Item.Anchor>
        </Layout.Stack>
        <ActionMenu.Item.Button
            on:click={() => {
                isOpen = false;
                showChat = !showChat;
            }}></ActionMenu.Item.Button>
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
