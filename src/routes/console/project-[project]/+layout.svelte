<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { sdkForConsole, sdkForProject, setProject } from '$lib/stores/sdk';
    import { collection } from './databases/database/[database]/collection/[collection]/store';
    import { UploadBox } from '$lib/components';
    import { project } from './store';
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
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

    // TODO: move to database routes
    if (browser) {
        sdkForConsole.client.subscribe<Attributes | Models.Index>('console', (message) => {
            if (message.events.includes('databases.*.collections.*.attributes.*.create')) {
                collection.addAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('databases.*.collections.*.attributes.*.update')) {
                collection.updateAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('databases.*.collections.*.attributes.*.delete')) {
                collection.removeAttribute(<Attributes>message.payload);

                return;
            }
        });
    }
    onMount(handle);
    afterNavigate(handle);

    let loaded = false;
    async function handle() {
        if (sdkForProject.client.config.project !== projectId) {
            setProject(projectId);
        }

        const promiseProject = project.load(projectId);
        if ($project?.$id !== projectId) {
            await promiseProject;

            const promiseOrganization = organization.load($project.teamId);
            if ($organization?.$id !== $project?.teamId) {
                await promiseOrganization;
            }
        }
        loaded = true;
    }
</script>

{#if loaded}
    <slot />
{:else}
    loading
{/if}

<UploadBox />
