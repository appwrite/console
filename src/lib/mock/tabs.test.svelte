<script>
    import { Tabs, Tab } from '../components';

    export let tabs = [];
</script>

<Tabs>
    {#each tabs as tab}
        <Tab href={tab.href}>
            {tab.title}
        </Tab>
    {/each}
</Tabs>
