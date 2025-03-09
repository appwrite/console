<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { ActionMenu, Popover } from '@appwrite.io/pink-svelte';
    import CreateCli from '../(modals)/createCli.svelte';
    import CreateGit from '../(modals)/createGit.svelte';
    import CreateManual from '../(modals)/createManual.svelte';
    import { showCreateDeployment } from '../store';

    let showCreateCli = false;
    let showCreateGit = false;
    let showCreateManual = false;

    beforeNavigate(() => ($showCreateDeployment = false));
</script>

<Popover let:toggle placement="bottom-end" padding="none">
    {#if $canWriteFunctions}
        <slot {toggle} />
    {/if}
    <svelte:fragment slot="tooltip" let:toggle>
        <ActionMenu.Root>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showCreateGit = true;
                    toggle(e);
                }}>
                Git
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showCreateCli = true;
                    toggle(e);
                }}>
                CLI
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showCreateManual = true;
                    toggle(e);
                }}>
                Manual
            </ActionMenu.Item.Button>
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>
<CreateCli bind:show={showCreateCli} />
<CreateGit bind:show={showCreateGit} />
<CreateManual bind:show={showCreateManual} />
