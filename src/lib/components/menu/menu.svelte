<script lang="ts">
    import { setContext, onMount } from 'svelte';
    import { Card } from '@appwrite.io/pink-svelte';
    import { createMenubar, melt } from '@melt-ui/svelte';
    import { activeMenuId, menuOpen } from '$lib/components/menu/store';

    const menuId = Math.random().toString(36).slice(2);
    const {
        elements: { menubar },
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { trigger, menu, separator },
        states: { open },
        builders // for submenu for same toggle state
    } = createMenu();

    function toggle() {
        open.update((state) => !state);
    }

    open.subscribe((state) => {
        if (state) activeMenuId.set(menuId);
        else activeMenuId.update((current) => (current === menuId ? null : current));
    });

    onMount(() => {
        return activeMenuId.subscribe((id) => {
            if (id !== menuId) open.set(false);
        });
    });

    $: menuOpen.set($open as boolean);

    setContext('menuBuilder', { builders, separator });
</script>

<div use:melt={$menubar}>
    {#if $open}
        <div style:display="none" id="actionmenuopen"></div>
    {/if}
    <div use:melt={$trigger}>
        <slot />
    </div>

    <div class="menu" use:melt={$menu}>
        <Card.Base padding="none">
            {#if $$slots.start}
                <slot name="start" />
                <div class="separator" use:melt={$separator}></div>
            {/if}
            <slot name="menu" {toggle} />
            {#if $$slots.end}
                <div class="separator" use:melt={$separator}></div>
                <slot name="end" {toggle} />
            {/if}
        </Card.Base>
    </div>
</div>

<style>
    .menu {
        min-width: 244px;
        width: max-content;
        z-index: 20;
    }

    .separator {
        height: 1px;
        margin-block: 2px;
        margin-inline-start: calc(var(--base-4) * -1);
        width: calc(100% + var(--base-8));
        background-color: var(--border-neutral);
    }
</style>
