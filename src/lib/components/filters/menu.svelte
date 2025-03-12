<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Card, Icon } from '@appwrite.io/pink-svelte';
    import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
    import { createMenubar, melt } from '@melt-ui/svelte';
    import { parsedTags } from './setFilters';

    const {
        elements: { menubar },
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: { trigger: trigger, menu: menu, separator: separator }
    } = createMenu();
</script>

<div use:melt={$menubar}>
    <div use:melt={$trigger}>
        {#if $parsedTags?.length}
            <Button secondary badge={`${$parsedTags?.length}`}>
                <Icon icon={IconFilterLine} slot="start" size="s" />
                Filters
            </Button>
        {:else}
            <Button secondary>
                <Icon icon={IconFilterLine} slot="start" size="s" />
                Filters
            </Button>
        {/if}
    </div>

    <div class="menu" use:melt={$menu}>
        <Card.Base padding="xxxs">
            <slot />
            <div class="separator" use:melt={$separator} />
            <slot name="end" />
        </Card.Base>
    </div>
</div>

<style>
    .menu {
        min-width: 244px;
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
