<script lang="ts">
    import { page } from '$app/stores';
    import { Tab, Tabs } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';

    const projectId = $page.params.project;
    const path = `/console/project-${projectId}/authentication`;
    type TabElement = { href: string; title: string; hasChildren?: boolean };
    const tabs: TabElement[] = [
        {
            href: path,
            title: 'Users',
            hasChildren: true
        },
        {
            href: `${path}/teams`,
            title: 'Teams',
            hasChildren: true
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/security`,
            title: 'Security'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];

    function isSelected(tab: TabElement, pathname: string, basePath: string) {
        if (!tab.hasChildren) {
            return tab.href === pathname;
        } else {
            if (tab.href === pathname) return true;

            if (tab.href === basePath) {
                if (!tabs.some((t) => pathname.includes(t.href) && t.href !== tab.href)) {
                    return pathname.includes(tab.href);
                }
            } else {
                return pathname.includes(tab.href);
            }
        }
    }
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>Authentication</CoverTitle>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={isSelected(tab, $page.url.pathname, path)}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
