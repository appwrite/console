<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import {
        organizationList,
        organization,
        memberList,
        newOrgModal,
        newMemberModal
    } from './store';
    import CreateMember from './_createMember.svelte';
    import Create from './_createOrganization.svelte';

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        await organizationList.load();
        if ($organizationList?.total) {
            if (!$organization) {
                await organization.load($organizationList.teams[0].$id);
                await memberList.load($organization.$id, '', 100, 0);
            }
            updateLayout({
                navigate: event,
                title: $organization?.name ?? `${$organizationList.teams[0].name}`,
                titleDropdown: $organizationList.teams,
                level: 0,
                customBase: '',
                breadcrumbs: {
                    title: `${$organization.name}`,
                    href: 'console'
                },
                tabs: [
                    {
                        href: 'console',
                        title: 'Projects'
                    },
                    {
                        href: 'console/members',
                        title: 'Members'
                    },
                    {
                        href: 'console/settings',
                        title: 'Settings'
                    }
                ]
            });
        } else {
            $newOrgModal = true;
            closable = false;
        }
    }

    let closable = true;

    organization.subscribe((org) => {
        handle();
        if (org?.$id) {
            memberList.load(org.$id, '', 100, 0);
        }
    });
</script>

<svelte:head>
    <title>Appwrite - Console</title>
</svelte:head>

<Shell>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    {#if $organization}
        <slot />
    {/if}
    <footer class="main-footer" />
</Shell>

<Create bind:show={$newOrgModal} {closable} />
<CreateMember bind:showCreate={$newMemberModal} />
