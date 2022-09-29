<script lang="ts">
    import { InputSearch, Button } from '$lib/elements/forms';
    import { Modal, Avatar } from '$lib/components';
    import { usersList } from '../authentication/store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { createFunction } from './wizard/store';
    import { Query } from '@aw-labs/appwrite-console';

    export let showUsers = false;

    let search: string;
    let offset = 0;
    let limit = 5;

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 64, 64).toString();

    function handleCheck(id: string) {
        if ($createFunction.execute.includes(`user:${id}`)) {
            $createFunction.execute = $createFunction.execute.filter(
                (item) => item !== `user:${id}`
            );
        } else {
            $createFunction.execute.push(`user:${id}`);
        }
        $createFunction = $createFunction;
    }

    $: usersList.load([Query.limit(limit), Query.offset(offset)], search);
    $: if (search) offset = 0;
</script>

<Modal bind:show={showUsers} size="big">
    <svelte:fragment slot="header">Select Users</svelte:fragment>
    <InputSearch bind:value={search} placeholder="Search" />
    {#if $usersList?.total}
        <div class="table-wrapper">
            <div class="table is-remove-outer-styles">
                <ul class="table-thead">
                    {#each $usersList.users as user}
                        <li class="table-row">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <input
                                    type="checkbox"
                                    name="user"
                                    checked={$createFunction.execute.includes(`user:${user.$id}`)}
                                    id={user.$id}
                                    on:change={() => {
                                        handleCheck(user.$id);
                                    }} />
                                <label for={user.$id} class="u-flex u-gap-12 u-cross-center">
                                    <Avatar size={32} src={getAvatar(user.name)} name={user.name} />
                                    <div>
                                        <p class="text">
                                            {user.name ?? user.email ?? user.phone ?? '-'}
                                        </p>
                                        <span class="text u-small">user:{user.$id}</span>
                                    </div>
                                </label>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>

        <div class="u-flex u-main-space-between">
            <p class="text u-small">Total results: {$usersList?.total}</p>

            <div class="u-flex u-gap-12">
                <Button text on:click={() => (offset = offset - limit)} disabled={offset === 0}>
                    <span class="icon-cheveron-left" />
                    Prev
                </Button>
                <Button
                    text
                    on:click={() => (offset = offset + limit)}
                    disabled={offset + limit >= $usersList.total}>
                    Next
                    <span class="icon-cheveron-right" />
                </Button>
            </div>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showUsers = false)}>Cancel</Button>
        <Button on:click={() => (showUsers = false)}>Add</Button>
    </svelte:fragment>
</Modal>
