<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { sdkForConsole, setProject } from '$lib/stores/sdk';
    import { collection } from './databases/database/[database]/collection/[collection]/store';
    import { UploadBox } from '$lib/components';
    import { project } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import type { Models } from '@aw-labs/appwrite-console';

    type Attributes =
        | Models.AttributeBoolean
        | Models.AttributeEmail
        | Models.AttributeEnum
        | Models.AttributeFloat
        | Models.AttributeInteger
        | Models.AttributeIp
        | Models.AttributeString
        | Models.AttributeUrl;

    $: projectId = $page.params.project;

    if (browser) {
        sdkForConsole.client.subscribe<Attributes | Models.Index>('console', (message) => {
            if (message.events.includes('collections.*.attributes.*.create')) {
                collection.addAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('collections.*.attributes.*.update')) {
                collection.updateAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('collections.*.attributes.*.delete')) {
                collection.removeAttribute(<Attributes>message.payload);

                return;
            }
        });
    }
    onMount(handle);
    afterNavigate(handle);

    let loaded = false;
    async function handle(event = null) {
        if ($project?.$id !== projectId) {
            setProject(projectId);
            if (browser) {
                await project.load(projectId);
            }
        }
        // TODO: make this part of state
        const organisation = await sdkForConsole.teams.get($project.teamId);

        updateLayout({
            navigate: event,
            title: $project.name,
            level: 2,
            breadcrumbs: [
                {
                    href: '#',
                    title: organisation.name
                },
                {
                    href: '#',
                    title: $project.name
                }
            ]
        });
        loaded = true;
    }
</script>

{#if loaded}
    <slot />
{:else}
    loading
{/if}

<UploadBox />
