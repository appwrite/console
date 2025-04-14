<script lang="ts" context="module">
    import { get } from 'svelte/store';

    let showDelete = writable(false);

    export const promptDeleteUser = (id: string) => {
        showDelete.set(true);
        goto(`${base}/project-${get(project).$id}/auth/user-${id}`);
    };
</script>

<script lang="ts">
    import { CardGrid, BoxAvatar, Heading, AvatarInitials } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { writable } from 'svelte/store';
    import DeleteUser from './deleteUser.svelte';
    import { user } from './store';
    import { goto } from '$app/navigation';
    import { project } from '../../store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { base } from '$app/paths';
    $: accessedAt = ($user as unknown as { accessedAt: string }).accessedAt;
</script>

<CardGrid danger>
    <div>
        <Heading tag="h6" size="7">Delete user</Heading>
    </div>
    <p>
        The user will be permanently deleted, including all data associated with this user. This
        action is irreversible.
    </p>
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="image">
                {#if $user.email || $user.phone}
                    {#if $user.name}
                        <AvatarInitials size={48} name={$user.name} />
                    {:else}
                        <div class="avatar">
                            <span class="icon-minus-sm" aria-hidden="true" />
                        </div>
                    {/if}
                {:else}
                    <div class="avatar">
                        <span class="icon-anonymous" aria-hidden="true" />
                    </div>
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1" data-private>
                    {$user.name || $user.email || $user.phone || 'Anonymous'}
                </h6>
            </svelte:fragment>
            <p class="u-trim-1" data-private>
                {$user.email && $user.phone
                    ? [$user.email, $user.phone].join(',')
                    : $user.email || $user.phone}
            </p>
            <p>Last activity: {accessedAt ? toLocaleDate(accessedAt) : 'never'}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => ($showDelete = true)} event="delete_user">Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteUser bind:showDelete={$showDelete} />
