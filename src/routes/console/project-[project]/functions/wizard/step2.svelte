<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem, Empty } from '$lib/components';
    import { createFunction } from './store';
    import SelectUsers from '../selectUsers.svelte';
    import SelectTeams from '../selectTeams.svelte';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';

    let showDropdown = false;
    let showUsers = false;
    let showTeams = false;

    function addRole(id: string) {
        if (!$createFunction.execute.includes(id)) {
            $createFunction.execute.push(id);
            $createFunction = $createFunction;
        }
        showDropdown = false;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. Check out our documentation for
        more on <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
            Permissions</a
        >.
    </svelte:fragment>

    <span class="u-sep-block-end">ROLE</span>
    {#if $createFunction?.execute?.length}
        <TableList>
            {#each $createFunction.execute as id}
                <li class="table-row">
                    <TableCellText title="id">
                        {id}
                    </TableCellText>
                    <TableCell showOverflow title="options" width={40}>
                        <button
                            class="button is-text is-only-icon"
                            aria-label="delete role"
                            on:click|preventDefault={() => {
                                $createFunction.execute = $createFunction.execute.filter(
                                    (item) => item !== id
                                );
                                $createFunction = $createFunction;
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </TableCell>
                </li>
            {/each}
        </TableList>
    {:else}
        <Empty isButton on:click={() => (showDropdown = !showDropdown)}>
            Add a role to get started
        </Empty>
    {/if}

    <DropList bind:show={showDropdown} position="bottom" arrow={false}>
        <div class="u-flex u-margin-block-start-16">
            <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="u-text">Add role</span>
            </Button>
        </div>
        <svelte:fragment slot="list">
            <DropListItem
                on:click={() => {
                    addRole('any');
                }}>
                Any
            </DropListItem>
            <DropListItem
                on:click={() => {
                    addRole('guests');
                }}>
                All guests
            </DropListItem>
            <DropListItem
                on:click={() => {
                    addRole('users');
                }}>
                All users
            </DropListItem>
            <DropListItem on:click={() => (showUsers = true)}>Select users</DropListItem>
            <DropListItem on:click={() => (showTeams = true)}>Select teams</DropListItem>
        </svelte:fragment>
    </DropList>
</WizardStep>

<SelectUsers {showUsers} />
<SelectTeams {showTeams} />
