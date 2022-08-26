<script lang="ts">
    import { updateLayout } from '$lib/stores/layout';
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

    $: org = $page.params.organization;
    $: path = `console/organization-${org}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($organization.$id !== org) {
            await organization.load(org);
            await memberList.load(org, '', 100, 0);
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
    <title>Appwrite - Console</title>
</svelte:head>

{#if $organization}
    <slot />
{/if}

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
