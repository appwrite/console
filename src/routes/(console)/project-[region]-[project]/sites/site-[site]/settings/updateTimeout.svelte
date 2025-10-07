<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';

    export let site: Models.Site;

    let timeout = 0;

    onMount(async () => (timeout = site.timeout));

    async function updateTimeout() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site?.framework as Framework,
                enabled: site?.enabled || undefined,
                logging: site?.logging || undefined,
                timeout: timeout || undefined,
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
                specification: isCloud ? site?.specification || undefined : undefined
            });
            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message: 'Timeout has been updated'
            });
            trackEvent(Submit.SiteUpdateTimeout);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SiteUpdateTimeout);
        }
    }
</script>

<Form onSubmit={updateTimeout}>
    <CardGrid>
        <svelte:fragment slot="title">Timeout</svelte:fragment>
        Set a time limit for the execution of your site. The maximum value is 30 seconds.
        <svelte:fragment slot="aside">
            <InputNumber
                min={1}
                max={30}
                id="time"
                label="Time (in seconds)"
                placeholder="Enter timeout"
                required
                bind:value={timeout} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={site.timeout === timeout || timeout < 1} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
