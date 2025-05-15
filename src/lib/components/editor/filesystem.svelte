<script lang="ts">
    import { createTreeView } from '@melt-ui/svelte';
    import { setContext } from 'svelte';
    import { treeFromFilesystem } from './(filesystem)';
    import Tree from './(filesystem)/tree.svelte';

    type Props = {
        files: string[];
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
    <!-- <Input.Text placeholder="Search" bind:value={search}>
        <Icon icon={IconSearch} slot="start" />
    </Input.Text> -->
    <Tree {items} />
</ul>

<style>
    ul {
        display: flex;
        flex-direction: column;
        gap: 0;
    }
</style>
