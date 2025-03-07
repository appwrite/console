<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import CreateCli from './createCli.svelte';
    import CreateGit from './createGit.svelte';
    import CreateManual from './createManual.svelte';
    import { showCreateDeployment } from './store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

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

<Popover let:toggle placement="bottom-end" padding="none">
    {#if $canWriteFunctions}
        <Button {secondary} icon={round} on:click={toggle} event="create_deployment">
            <slot>
                {#if !secondary}
                    <Icon icon={IconPlus} size="s" />
                {/if}
                Create deployment
            </slot>
        </Button>
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
