<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { DirectoryPicker } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    type Directory = {
        title: string;
        fullPath: string;
        fileCount: number;
        thumbnailUrl: string;
        children?: Directory[];
    };

    export let show = false;
    export let rootDir: string;

    let isLoading = true;
    let directories: Directory[] = [
        {
            title: 'Root',
            fullPath: './',
            fileCount: 0,
            thumbnailUrl: 'root',
            children: []
        }
    ];

    onMount(async () => {
        try {
            const baseRoute = './';
            const content = await sdk.forProject.vcs.getRepositoryContents(
                $installation.$id,
                $repository.id,
                baseRoute
            );
            console.log(content);
            directories[0].fileCount = content.contents.length;
            directories[0].children = content.contents.map((element) => ({
                id: element.name,
                title: element.name,
                fullPath: baseRoute + element.name,
                fileCount: element.size,
                thumbnailUrl: element.name
            }));
            console.log(directories);
            isLoading = false;
        } catch (e) {
            console.log(e);
        }
    });

    async function fectchContents() {}

    $: console.log(rootDir);
</script>

<Modal title="Root directory" bind:show>
    <span slot="description">
        Select the directory where your site code is located using the menu below.
    </span>
    <DirectoryPicker {directories} {isLoading} bind:value={rootDir} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
    </svelte:fragment>
</Modal>
