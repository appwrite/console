<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { organizationList } from './store';

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        await organizationList.load();
        updateLayout({
            navigate: event,
            title: `${$organizationList.teams[0].name}`,
            titleDropdown: $organizationList.teams,
            level: 0,
            customBase: '',
            breadcrumbs: {
                title: `${$organizationList.teams[0].name}`,
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
    }
</script>

<Shell>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>
