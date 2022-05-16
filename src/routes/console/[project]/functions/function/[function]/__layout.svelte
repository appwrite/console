<script lang="ts">
    import { browser } from '$app/env';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back, Tabs, TabsItem } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { func } from './store';

    const project = $page.params.project;
    const functionId = $page.params.function;

    $: {
        if (browser) {
            func.load(functionId);
        }
    }
</script>

{#if $func}
    <Cover>
        <svelte:fragment slot="breadcrumbs">
            <Back href={`${base}/console/${project}/functions`}>Functions</Back>
        </svelte:fragment>
        <svelte:fragment slot="title">{$func.name}</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/functions/function/${functionId}`}
                >Overview</TabsItem>
            <TabsItem href={`/console/${project}/functions/function/${functionId}/monitors`}
                >Monitors</TabsItem>
            <TabsItem href={`/console/${project}/functions/function/${functionId}/logs`}
                >Logs</TabsItem>
            <TabsItem href={`/console/${project}/functions/function/${functionId}/settings`}
                >Settings</TabsItem>
        </Tabs>
    </Cover>

    <slot />
{/if}
