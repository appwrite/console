<script lang="ts">
    import { CardGrid, Box, AvatarGroup, Heading } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { members, organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import Delete from '../deleteOrganization.svelte';

    let name: string;
    let showDelete = false;

    onMount(() => {
        name = $organization.name;
    });

    async function updateName() {
        try {
            await sdkForConsole.teams.update($organization.$id, name);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: avatars = $members.memberships.map((team) => team.userName);
</script>

<Container>
    {#if $organization}
        <Form on:submit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">Update Name</Heading>

                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter name"
                            autocomplete={false}
                            bind:value={name} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $organization.name || !name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <div>
                <Heading tag="h6" size="7">Delete Organization</Heading>
            </div>
            <p>
                The organization will be permanently deleted, including all projects and data
                associated with this organization. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <AvatarGroup {avatars} total={$members.total} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$organization.name}</h6>
                    </svelte:fragment>
                    <p>{$organization.total} projects</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
