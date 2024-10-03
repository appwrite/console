<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { DropList, DropListItem } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { canWriteFunctions } from '$lib/stores/roles';
    import CreateCli from './createCli.svelte';
    import CreateGit from './createGit.svelte';
    import CreateManual from './createManual.svelte';
    import { showCreateDeployment } from './store';

    export let secondary = false;
    export let round = false;
    // This allows us to know which one to open when the user uses the shortcut in the command center
    export let main = false;
    let show = false;
    let showCreateCli = false;
    let showCreateGit = false;
    let showCreateManual = false;

    beforeNavigate(() => ($showCreateDeployment = false));

    $: if ($showCreateDeployment && main) {
        show = true;
    }
</script>

<DropList bind:show placement="bottom-end">
    {#if $canWriteFunctions}
        <Button {secondary} {round} on:click={() => (show = !show)} event="create_deployment">
            <slot>
                {#if !secondary}
                    <span class="icon-plus" aria-hidden="true" />
                {/if}
                <span class="text">Create deployment</span>
            </slot>
        </Button>
    {/if}
    <svelte:fragment slot="list">
        <DropListItem
            on:click={() => {
                showCreateGit = true;
                show = false;
            }}>Git</DropListItem>
        <DropListItem
            on:click={() => {
                showCreateCli = true;
                show = false;
            }}>CLI</DropListItem>
        <DropListItem
            on:click={() => {
                showCreateManual = true;
                show = false;
            }}>Manual</DropListItem>
    </svelte:fragment>
</DropList>
<CreateCli bind:show={showCreateCli} />
<CreateGit bind:show={showCreateGit} />
<CreateManual bind:show={showCreateManual} />
