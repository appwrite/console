<script lang="ts">
    import { createTreeView } from '@melt-ui/svelte';
    import { setContext } from 'svelte';
    import { treeFromFilesystem } from './(filesystem)';
    import Tree from './(filesystem)/tree.svelte';
    import type { SvelteSet } from 'svelte/reactivity';
    import { Layout, Icon, Input } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconDocumentAdd, IconFolderAdd, IconSearch } from '@appwrite.io/pink-icons-svelte';

    type Props = {
        files: SvelteSet<string>;
        onopenfile: (path: string) => void;
        onopenfolder: (path: string) => void;
    };
    let { files, onopenfile, onopenfolder = null }: Props = $props();

    const ctx = createTreeView();
    setContext('tree', ctx);

    const {
        elements: { tree },
        states: { selectedItem }
    } = ctx;
    const items = $derived(treeFromFilesystem(files));

    $effect(() => {
        if ($selectedItem) {
            if ($selectedItem.dataset['file'] === 'true') {
                onopenfile($selectedItem.dataset['id']);
            } else {
                onopenfolder($selectedItem.dataset['id']);
            }
        }
    });
</script>

<ul {...$tree}>
    <Input.Text placeholder="Search">
        <Icon icon={IconSearch} slot="start" />
    </Input.Text>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <span>FILES</span>
        <Layout.Stack direction="row" justifyContent="flex-end" gap="s">
            <div class="icon-container">
                <Button compact><Icon icon={IconDocumentAdd} /></Button>
            </div>
            <div class="icon-container">
                <Button compact><Icon icon={IconFolderAdd} /></Button>
            </div>
        </Layout.Stack>
    </Layout.Stack>

    <Tree {items} />
</ul>

<style lang="scss">
    ul {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: scroll;
        scrollbar-width: none;
        background-color: var(--bgcolor-neutral-default);
        margin-block-start: calc(-1 * var(--space-4));
        height: calc(100% + var(--space-4));
        padding: var(--space-4);
    }

    span {
        font-family: var(--font-family-monospace);
        font-size: var(--font-size-xs);
    }

    .icon-container {
        --icon-fill: var(--fgcolor-neutral-tertiary);

        &:hover {
            --icon-fill: var(--fgcolor-neutral-secondary);
        }
    }
</style>
