<script lang="ts">
    import { Card } from '@appwrite.io/pink-svelte';
    import { createMenubar, melt } from '@melt-ui/svelte';

    const {
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { separator: separator },
        builders: { createSubmenu: createSubmenu }
    } = createMenu();

    const {
        elements: { subMenu: subMenu, subTrigger: subTrigger }
    } = createSubmenu();
</script>

<div use:melt={$subTrigger}>
    <slot />
</div>

<div class="subMenu" use:melt={$subMenu}>
    <Card.Base padding="none">
        {#if $$slots.start}
            <slot name="start" />
            <div class="separator" use:melt={$separator}></div>
        {/if}
        <slot name="menu" />
        {#if $$slots.end}
            <div class="separator" use:melt={$separator}></div>
            <slot name="end" />
        {/if}
    </Card.Base>
</div>

<style>
    .subMenu {
        min-width: 244px;
        margin-block: -4px;
    }
</style>
