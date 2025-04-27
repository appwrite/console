<script lang="ts">
    import { createTreeView } from '@melt-ui/svelte';
    import { setContext } from 'svelte';
    import { treeFromFilesystem } from './(filesystem)';
    import Tree from './(filesystem)/tree.svelte';

    type Props = {
        files: string[];
        onopenfile?: (path: string) => void;
    };
    let { files, onopenfile = null }: Props = $props();

    const ctx = createTreeView();
    setContext('tree', ctx);

    const {
        elements: { tree },
        states: { selectedItem }
    } = ctx;

    const items = $derived(treeFromFilesystem(files));
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
