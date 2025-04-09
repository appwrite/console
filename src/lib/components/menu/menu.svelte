<script lang="ts">
    import { Card } from '@appwrite.io/pink-svelte';
    import { createMenubar, melt } from '@melt-ui/svelte';

    const {
        elements: { menubar },
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { trigger: trigger, menu: menu, separator: separator },
        states: { open }
    } = createMenu();

    function toggle() {
        open.update((state) => !state);
    }
</script>

<div use:melt={$menubar}>
    {#if $open}
        <div style:display="none" id="actionmenuopen"></div>
    {/if}
    <div use:melt={$trigger}>
        <slot />
    </div>

    <div class="menu" use:melt={$menu}>
        <Card.Base padding="xxxs">
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
