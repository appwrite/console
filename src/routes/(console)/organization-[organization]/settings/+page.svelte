<script lang="ts">
    import { CardGrid, BoxAvatar, AvatarGroup } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { members, organization } from '$lib/stores/organization';
    import { projects } from '../store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import Delete from './deleteOrganizationModal.svelte';
    import DownloadDPA from './downloadDPA.svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud } from '$lib/system';
    import Baa from './BAA.svelte';
    import Soc2 from './Soc2.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let name: string;
    let showDelete = false;

    onMount(() => {
        name = $organization.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.teams.updateName({
                teamId: $organization.$id,
                name
            });
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.OrganizationUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.OrganizationUpdateName);
        }
    }

    $: avatars = $members.memberships.map((m) => m.userName || m.userEmail);
    $: orgProjects = `${$projects.total} ${$projects.total === 1 ? 'project' : 'projects'}`;
    $: orgMembers = `${$organization.total} ${$organization.total === 1 ? 'member' : 'members'}`;
</script>

<Container>
    {#if $organization}
        <Form onSubmit={updateName}>
            <CardGrid>
                <svelte:fragment slot="title">Name</svelte:fragment>
                <svelte:fragment slot="aside">
                    <InputText
                        required
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        bind:value={name} />
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $organization.name || !name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        {#if isCloud}
            <DownloadDPA />
            <Baa locale={data.locale} countryList={data.countryList} />
            <Soc2 locale={data.locale} countryList={data.countryList} />
        {/if}

        <CardGrid>
            <svelte:fragment slot="title">Delete organization</svelte:fragment>
            The organization will be permanently deleted, including all projects and data associated with
            this organization. This action is irreversible.
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <svelte:fragment slot="image">
                        <AvatarGroup {avatars} total={$members.total} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1" data-private>{$organization.name}</h6>
                    </svelte:fragment>
                    <p>{orgMembers}, {orgProjects}</p>
                </BoxAvatar>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={$organization?.markedForDeletion}
                    secondary
                    on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete invoices={data.invoices} />
