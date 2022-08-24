<script lang="ts">
    import { CardGrid, Box, AvatarGroup } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { organization, memberList } from './store';
    import { title, breadcrumbs } from '$lib/stores/layout';
    import Delete from './_deleteOrganization.svelte';

    let name: string = $organization.name;
    let showDelete = false;

    async function updateName() {
        try {
            await sdkForConsole.teams.update($organization.$id, name);
            $organization.name = name;
            title.set(name);
            const breadcrumb = $breadcrumbs.get(0);
            breadcrumb.title = name;
            $breadcrumbs = $breadcrumbs.set($breadcrumbs.size, breadcrumb);
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

    organization.subscribe((org) => {
        name = org.name;
        memberList.load(org.$id, '', 100, 0);
    });

    let avatars = [];
    let avatarsTotal = 0;

    memberList.subscribe((value) => {
        if (value?.total > 0) {
            avatarsTotal = value.total;
            avatars = value.memberships.map((team) => {
                return {
                    name: team.userName,
                    img: sdkForConsole.avatars.getInitials(team.userName, 120, 120).toString()
                };
            });
        }
    });
</script>

<Container>
    <Form on:submit={updateName}>
        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

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
            <h6 class="heading-level-7">Delete Organization</h6>
        </div>
        <p>
            The organization will be permanently deleted, including all projects and data associated
            with this organization. This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="image">
                    <AvatarGroup {avatars} total={avatarsTotal} />
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
</Container>

<Delete bind:showDelete />
