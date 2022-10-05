<script lang="ts">
    import { pageLimit, updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import {
        organizationList,
        organization,
        memberList,
        newOrgModal,
        newMemberModal
    } from '$lib/stores/organization';
    import CreateMember from './_createMember.svelte';
    import Create from '../_createOrganization.svelte';
    import { page } from '$app/stores';
    import { Query } from '@aw-labs/appwrite-console';

    $: organizationId = $page.params.organization;
    $: path = `console/organization-${organizationId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promises = Promise.all([
            organization.load(organizationId),
            memberList.load(organizationId, [Query.limit(12)])
        ]);

        if ($organization?.$id !== organizationId) {
            await promises;
        }

        updateLayout({
            navigate: event,
            title: $organization?.name,
            titleDropdown: $organizationList.teams,
            level: 0,
            customBase: '',
            breadcrumbs: {
                title: `${$organization.name}`,
                href: path
            },
            tabs: [
                {
                    href: path,
                    title: 'Projects'
                },
                {
                    href: `${path}/members`,
                    title: 'Members'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Organizations</title>
</svelte:head>

{#if $organization}
    <slot />
{/if}

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
