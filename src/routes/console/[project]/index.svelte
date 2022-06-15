<script lang="ts">
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { Button } from '$lib/elements/forms';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from './store';
    import { Card, List, ListItem } from '$lib/components';
    import { Cover, Container } from '$lib/layout';
    import { Line } from '$lib/charts';
    // import { page } from '$app/stores';
    import { base } from '$app/paths';
    import CreatePlatform from './_createPlatform.svelte';

    title.set($project.name);
    tabs.set([]);
    backButton.set('');

    copyData.set({
        text: '',
        value: ''
    });

    let addPlatform = false;
    // let range: '24h' | '30d' | '90d' = '30d';

    // $: requestUsage = sdkForConsole.projects.getUsage($page.params.project, range);
</script>

<svelte:head>
    <title>Appwrite - Console</title>
</svelte:head>

{#if $project}
    <Cover adjustContentToCover>
        <ul class="links-nav">
            <li class="links-nav-item">
                <a class="link" href={`${base}/console/${$project.$id}/settings`}>
                    <span class="icon-cog" aria-hidden="true" />
                    <span class="text">Settings</span>
                </a>
            </li>
            <li class="links-nav-item">
                <a class="link" href={`${base}/console/${$project.$id}/keys`}>
                    <span class="icon-key" aria-hidden="true" />
                    <span class="text">API Keys</span>
                </a>
            </li>
            <li class="links-nav-item">
                <a class="link" href={`${base}/console/${$project.$id}/webhooks`}>
                    <span class="icon-link" aria-hidden="true" />
                    <span class="text">Webhooks</span>
                </a>
            </li>
        </ul>
    </Cover>
    <Container>
        <Card>
            <Line />
        </Card>
        <h1>Platforms</h1>
        <List>
            {#each $project.platforms as platform}
                <ListItem
                    avatar={sdkForConsole.avatars.getInitials(platform.type, 60, 60).toString()}>
                    <svelte:fragment slot="header">
                        <h2 class="sessions-item-title">
                            <span class="text">
                                {platform.name}
                            </span>
                        </h2>
                    </svelte:fragment>
                    <svelte:fragment slot="info">
                        {platform.hostname}
                    </svelte:fragment>
                    <svelte:fragment slot="action">
                        <Button>Manage</Button>
                    </svelte:fragment>
                </ListItem>
            {:else}
                <Card>
                    <b>No Platforms Added to Your Project</b>
                    <p>Add your first platform and build your new application.</p>
                </Card>
            {/each}
            <Button on:click={() => (addPlatform = true)}>Add Platform</Button>
            <CreatePlatform bind:show={addPlatform} />
        </List>
    </Container>
{/if}
