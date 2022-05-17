<script>
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Tabs, TabsItem } from '$lib/layout';
    import { Cover } from '$lib/layout';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<Cover>
    <svelte:fragment slot="breadcrumbs">
        <Back href={`${base}/console/${project}`}>Home</Back>
    </svelte:fragment>
    <svelte:fragment slot="title">Settings</svelte:fragment>
    <Tabs>
        <TabsItem href={`/console/${project}/settings`}>Overview</TabsItem>
        <TabsItem href={`/console/${project}/settings/services`}>Services</TabsItem>
        <TabsItem href={`/console/${project}/settings/domains`}>Custom Domains</TabsItem>
        <TabsItem href={`/console/${project}/settings/members`}>Members</TabsItem>
    </Tabs>
</Cover>
<slot />
