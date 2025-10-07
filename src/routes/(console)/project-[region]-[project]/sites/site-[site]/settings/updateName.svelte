<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { page } from '$app/state';

    export let site: Models.Site;
    let siteName: string = null;

    onMount(async () => {
        siteName ??= site.name;
    });

    async function updateName() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: siteName,
                framework: site.framework as Framework,
                enabled: site?.enabled || undefined,
                logging: site?.logging || undefined,
                timeout: site?.timeout || undefined,
                installCommand: site?.installCommand || undefined,
                buildCommand: site?.buildCommand || undefined,
                outputDirectory: site?.outputDirectory || undefined,
                buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                adapter: site?.adapter as Adapter,
                fallbackFile: site?.fallbackFile || undefined,
                installationId: site?.installationId || undefined,
                providerRepositoryId: site?.providerRepositoryId || undefined,
                providerBranch: site?.providerBranch || undefined,
                providerSilentMode: site?.providerSilentMode || undefined,
                providerRootDirectory: site?.providerRootDirectory || undefined,
                specification: site?.specification || undefined
            });
            await invalidate(Dependencies.SITE);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.SiteUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SiteUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                required
                bind:value={siteName} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={siteName === site.name || !siteName} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
