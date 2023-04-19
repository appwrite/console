<script lang="ts">
    import { CardGrid, Box, Heading, AvatarInitials } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import DeleteUser from './deleteUser.svelte';
    import { user } from './store';

    let showDelete = false;
</script>

<CardGrid danger>
    <div>
        <Heading tag="h6" size="7">Danger Zone</Heading>
    </div>
    <p>
        The user will be permanently deleted, including all data associated with this user. This
        action is irreversible.
    </p>
    <svelte:fragment slot="aside">
        <Box>
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
        </Box>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_user">Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteUser bind:showDelete />
