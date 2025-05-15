<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import { iconPath } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';

    export let site: Models.Site;
    export let frameworks: Models.Framework[];
    const framework = frameworks.find((framework) => framework.key === site.framework);
    let buildRuntime = site?.buildRuntime;

    let buildRuntimeOptions = framework.runtimes.map((runtime) => ({
        label: capitalize(runtime),
        value: runtime,
        leadingHtml: `<img src='${$iconPath(getIconFromRuntime(runtime), 'color')}' style='inline-size: var(--icon-size-m)' />`
    }));

    async function updateRuntime() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .sites.update(
                    site.$id,
                    site.name,
                    site?.framework as Framework,
                    site?.enabled || undefined,
                    site?.logging || undefined,
                    site?.timeout || undefined,
                    site?.installCommand || undefined,
                    site?.buildCommand || undefined,
                    site?.outputDirectory || undefined,
                    (buildRuntime as BuildRuntime) || undefined,
                    site?.adapter as Adapter,
                    site?.fallbackFile || undefined,
                    site?.installationId || undefined,
                    site?.providerRepositoryId || undefined,
                    site?.providerBranch || undefined,
                    site?.providerSilentMode || undefined,
                    site?.providerRootDirectory || undefined,
                    site?.specification || undefined
                );
            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message: 'Runtime has been updated'
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
        <svelte:fragment slot="title">Runtime settings</svelte:fragment>
        Select the runtime for building and serving your site. Version changes apply on redeploy and
        can be updated here.
        <svelte:fragment slot="aside">
            <InputSelect
                label="Build runtime"
                id="build-runtime"
                placeholder="Select runtime"
                bind:value={buildRuntime}
                options={buildRuntimeOptions}
                required />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={buildRuntime === site.buildRuntime} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
