<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { BuildRuntime, Framework, ServeRuntime, type Models } from '@appwrite.io/console';

    export let site: Models.Site;
    export let frameworks: Models.Framework[];
    let buildRuntime: string = null;
    let serveRuntime: string = null;

    let buildRuntimeOptions = [];
    let serveRuntimeOptions = [];

    onMount(async () => {
        buildRuntime ??= site.buildRuntime;
        serveRuntime ??= site.serveRuntime;

        const framework = frameworks.find((framework) => framework.key === site.framework);

        buildRuntimeOptions = framework.buildRuntimes.map((runtime) => ({
            label: runtime,
            value: runtime
        }));
        serveRuntimeOptions = framework.serveRuntimes.map((runtime) => ({
            label: runtime,
            value: runtime
        }));
    });
    async function updateRuntime() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                Framework[site?.framework] || undefined,
                site.enabled || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                BuildRuntime[site?.buildRuntime] || undefined,
                ServeRuntime[site?.serveRuntime] || undefined,
                site.fallbackFile || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined,
                site.specification || undefined
            );
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

<Form onSubmit={updateRuntime}>
    <CardGrid>
        <Heading tag="h6" size="7">Runtime settings</Heading>
        <p class="text">
            Select the runtime for building and serving your site. Version changes apply on redeploy
            and can be updated here.
        </p>

        <svelte:fragment slot="aside">
            <InputSelect
                label="Build runtime"
                id="build-runtime"
                placeholder="Select runtime"
                bind:value={buildRuntime}
                options={buildRuntimeOptions}
                required
                hideRequired />
            <InputSelect
                label="Serve runtime"
                id="serve-runtime"
                placeholder="Select runtime"
                bind:value={serveRuntime}
                options={serveRuntimeOptions}
                required
                hideRequired />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={buildRuntime === site.buildRuntime && serveRuntime === site.serveRuntime}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
