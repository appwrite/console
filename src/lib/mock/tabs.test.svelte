<script lang="ts">
    import { Tabs, Tab } from '../components';

    export let tabs: Array<{ href: string; title: string }> = [];
</script>

<Tabs>
    {#each tabs as tab}
        <Tab href={tab.href}>
            {tab.title}
        </Tab>
    {/each}
</Tabs>
