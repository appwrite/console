<script lang="ts">
    import { melt, type TreeView } from '@melt-ui/svelte';
    import { getContext } from 'svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { icons, type TreeItem } from '.';

    export let items: TreeItem[];
    export let level = 1;

    const {
        elements: { item, group },
        helpers: { isExpanded, isSelected }
    } = getContext<TreeView>('tree');
</script>

{#each items as { title, icon, children, path }, i}
    {@const hasChildren = !!children?.length}
    {@const isRoot = level === 1}

    <li style:margin-inline-start={isRoot ? '' : '1rem'}>
        <button
            data-file={!hasChildren}
            class:selected={$isSelected(path)}
            use:melt={$item({
                id: path,
                hasChildren
            })}>
            {#if icon === 'folder' && hasChildren && $isExpanded(path)}
                <Icon icon={icons['folderOpen']} />
            {:else}
                <Icon icon={icons[icon]} />
            {/if}

            <span>{title}</span>
        </button>

        {#if children}
            <ul use:melt={$group({ id: path })}>
                <svelte:self items={children} level={level + 1} />
            </ul>
        {/if}
    </li>
{/each}

<style>
    button {
        display: flex;
        width: 100%;
        height: 2rem;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
        user-select: none;
        padding: var(--space-3) var(--space-4);
        cursor: pointer;
        border-radius: var(--border-radius-s);
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        &.selected {
            background: var(--bgcolor-neutral-tertiary);
        }
        &:hover:not(.selected) {
            background: var(--bgcolor-neutral-secondary);
        }
        &:focus-visible {
            outline: 2px solid #007aff;
            outline-offset: -2px;
        }
    }
</style>
