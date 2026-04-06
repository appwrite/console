<script lang="ts">
    import { CardGrid, BoxAvatar, AvatarGroup } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { members, organization } from '$lib/stores/organization';
    import { projects } from '../store';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
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

    onMount(async () => {
        name = $organization.name;

        if (page.url.searchParams.get('type') === 'confirm-addon') {
            let addonId = page.url.searchParams.get('addonId');

            // Fall back to listing addons if addonId is missing or invalid
            let lookupFailed = false;
            if (!addonId || addonId === 'undefined') {
                try {
                    const addons = await sdk.forConsole.organizations.listAddons({
                        organizationId: $organization.$id
                    });
                    const pending = addons.addons.find(
                        (a) => a.key === 'baa' && a.status === 'pending'
                    );
                    addonId = pending?.$id ?? null;
                } catch (e) {
                    lookupFailed = true;
                    addNotification({
                        message: e?.message ?? 'Unable to verify BAA addon status. Please retry.',
                        type: 'error'
                    });
                }
            }

            if (lookupFailed) {
                const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
                    organization: $organization.$id
                });
                await goto(settingsUrl, { replaceState: true });
                return;
            }

            if (addonId) {
                try {
                    await sdk.forConsole.organizations.confirmAddonPayment({
                        organizationId: $organization.$id,
                        addonId
                    });
                    await Promise.all([
                        invalidate(Dependencies.ADDONS),
                        invalidate(Dependencies.ORGANIZATION)
                    ]);
                    addNotification({
                        message: 'BAA addon has been enabled',
                        type: 'success'
                    });
                } catch (e) {
                    // If addon not found, payment webhook may have already activated it
                    if (e?.type === 'addon_not_found' || e?.code === 404) {
                        await Promise.all([
                            invalidate(Dependencies.ADDONS),
                            invalidate(Dependencies.ORGANIZATION)
                        ]);
                        addNotification({
                            message: 'BAA addon has been enabled',
                            type: 'success'
                        });
                    } else {
                        addNotification({
                            message: e.message,
                            type: 'error'
                        });
                    }
                }
            } else {
                addNotification({
                    message:
                        'Could not verify BAA payment. Please check your BAA status or contact support.',
                    type: 'error'
                });
            }

            const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
                organization: $organization.$id
            });
            await goto(settingsUrl, { replaceState: true });
        }
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
            <Baa addons={data.addons} />
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
