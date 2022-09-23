<script lang="ts">
    import { InputSearch, Button } from '$lib/elements/forms';
    import { Modal, Avatar } from '$lib/components';
    import { teamsList } from '../authentication/store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createFunction } from './wizard/store';

    export let showTeams = false;

    let search: string;
    let offset = 0;
    let limit = 5;

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 64, 64).toString();

    function handleCheck(id: string) {
        if ($createFunction.execute.includes(`team:${id}`)) {
            $createFunction.execute = $createFunction.execute.filter(
                (item) => item !== `team:${id}`
            );
        } else {
            $createFunction.execute.push(`team:${id}`);
        }
        $createFunction = $createFunction;
    }

    $: teamsList.load(search, limit, offset ?? 0);
    $: if (search) offset = 0;
</script>

<Modal bind:show={showTeams} size="big">
    <svelte:fragment slot="header">Select teams</svelte:fragment>
    <InputSearch bind:value={search} placeholder="Search" />
    {#if $teamsList?.total}
        <div class="table-wrapper">
            <div class="table is-remove-outer-styles">
                <ul class="table-thead">
                    {#each $teamsList.teams as team}
                        <li class="table-row">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <input
                                    type="checkbox"
                                    name="team"
                                    checked={$createFunction.execute.includes(`team:${team.$id}`)}
                                    id={team.$id}
                                    on:change={() => {
                                        handleCheck(team.$id);
                                    }} />
                                <label for={team.$id} class="u-flex u-gap-12 u-cross-center">
                                    <Avatar size={32} src={getAvatar(team.name)} name={team.name} />
                                    <div>
                                        <p class="text">
                                            {team.name ?? '-'}
                                        </p>
                                        <span class="text u-small">team:{team.$id}</span>
                                    </div>
                                </label>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
        <div class="u-flex u-main-space-between">
            <p class="text u-small">Total results: {$teamsList?.total}</p>

            <div class="u-flex u-gap-12">
                <Button text on:click={() => (offset = offset - limit)} disabled={offset === 0}>
                    <span class="icon-cheveron-left" />
                    Prev
                </Button>
                <Button
                    text
                    on:click={() => (offset = offset + limit)}
                    disabled={offset + limit >= $teamsList.total}>
                    Next
                    <span class="icon-cheveron-right" />
                </Button>
            </div>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showTeams = false)}>Cancel</Button>
        <Button submit>Add</Button>
    </svelte:fragment>
</Modal>
