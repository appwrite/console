<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem } from '$lib/components';
    import { createFunction } from './store';
    import SelectUsers from '../selectUsers.svelte';
    import SelectTeams from '../selectTeams.svelte';

    let showDropdown = false;
    let showUsers = false;
    let showTeams = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. Check out our documentation for
        more on <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
            Permissions</a
        >.
    </svelte:fragment>

    ROLE

    <div class="table-with-scroll">
        <div class="table-wrapper">
            <div class="table is-remove-outer-styles">
                <ul class="table-thead">
                    {#each $createFunction.execute as id}
                        <li class="table-row">
                            <div class="table-col" data-title="Name">
                                <span class="text">blahblahkey</span>
                            </div>
                            <div class="table-col" data-title="Name">
                                <span class="text">{id}</span>
                            </div>
                            <div
                                class="table-col u-overflow-visible"
                                data-title="options"
                                style="--p-col-width:40">
                                <button
                                    class="button is-text is-only-icon"
                                    aria-label="delete id"
                                    on:click={() => {
                                        $createFunction.execute = $createFunction.execute.filter(
                                            (item) => item !== id
                                        );
                                        $createFunction = $createFunction;
                                    }}>
                                    <span class="icon-trash" aria-hidden="true" />
                                </button>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>

    <DropList bind:show={showDropdown} position="bottom" arrow={false}>
        <Button text on:click={() => (showDropdown = !showDropdown)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="u-text">Add role</span>
        </Button>

        <svelte:fragment slot="list">
            <DropListItem
                on:click={() => {
                    $createFunction.execute.push('role:any');
                    $createFunction = $createFunction;
                }}>
                Any
            </DropListItem>
            <DropListItem
                on:click={() => {
                    $createFunction.execute.push('role:guest');
                    $createFunction = $createFunction;
                }}>
                All guests
            </DropListItem>
            <DropListItem
                on:click={() => {
                    $createFunction.execute.push('role:member');
                    $createFunction = $createFunction;
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
