<script lang="ts">
    import { newMemberModal, newOrgModal } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { registerCommands } from '$lib/commandCenter';
    import { requestedMigration } from '$routes/store';
    import { openMigrationWizard } from '../(migration-wizard)';
    import { base } from '$app/paths';
    import { isOwner } from '$lib/stores/roles';
    import type { LayoutProps } from './$types';
    import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';

    let { data, children }: LayoutProps = $props();

    $effect(() => {
        if ($requestedMigration) {
            openMigrationWizard();
        }
    });

    $effect(() =>
        $registerCommands([
            {
                label: 'Go to members',
                callback: () => {
                    goto(`${base}/organization-${data.organization.$id}/members`);
                },
                keys: ['g', 'm'],
                disabled: page.url.pathname.endsWith('/members') || !$isOwner,
                group: 'navigation'
            },
            {
                label: 'Go to settings',
                callback: () => {
                    goto(`${base}/organization-${data.organization.$id}/settings`);
                },
                keys: ['g', 's'],
                disabled: page.url.pathname.endsWith('/settings') || !$isOwner,
                group: 'navigation'
            }
        ])
    );

    const pageTitle = $derived.by(() => {
        const platform = resolvedProfile.platform;
        return resolvedProfile.id === ProfileMode.STUDIO ? platform : `Organizations - ${platform}`;
    });
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

{@render children()}

<Create bind:show={$newOrgModal} />

{#if page.data.supportsMoreMembers}
    <CreateMember bind:showCreate={$newMemberModal} />
{/if}
