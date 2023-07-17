<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import CreateCli from './createCli.svelte';
    import CreateGit from './createGit.svelte';
    import CreateManual from './createManual.svelte';

    export let showCreate = false;
    let showCreateCli = false;
    let showCreateGit = false;
    let showCreateManual = false;
</script>

<DropList bind:show={showCreate} placement="bottom-end">
    <Button on:click={() => (showCreate = true)} event="create_deployment">
        <span class="icon-plus" aria-hidden="true" />
        <span class="text">Create deployment</span>
    </Button>
    <svelte:fragment slot="list">
        <DropListItem on:click={() => (showCreateGit = true)}>Git</DropListItem>
        <DropListItem on:click={() => (showCreateCli = true)}>CLI</DropListItem>
        <DropListItem on:click={() => (showCreateManual = true)}>Manual</DropListItem>
    </svelte:fragment>
</DropList>
<CreateCli bind:show={showCreateCli} />
<CreateGit bind:show={showCreateGit} />
<CreateManual bind:show={showCreateManual} />
