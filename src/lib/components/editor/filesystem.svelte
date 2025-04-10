<script lang="ts">
    import { createTreeView } from '@melt-ui/svelte';
    import { setContext } from 'svelte';
    import { treeFromFilesystem } from './(filesystem)';
    import type { FileSystem } from './filesystem';
    import Tree from './(filesystem)/tree.svelte';

    type Props = {
        filesystem: FileSystem;
        onopenfile?: (path: string) => void;
    };
    let { filesystem, onopenfile = null }: Props = $props();

    const ctx = createTreeView();
    setContext('tree', ctx);

    const {
        elements: { tree },
        states: { selectedItem }
    } = ctx;

    const items = $derived(treeFromFilesystem(filesystem));
    $effect(() => {
        if ($selectedItem && onopenfile) {
            if ($selectedItem.dataset['file'] === 'true') {
                onopenfile($selectedItem.dataset['id']);
            }
        }
    });
</script>

<ul {...$tree}>
    <Tree {items} />
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
        gap: 0;
    }
</style>
