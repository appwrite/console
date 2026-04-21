<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';

    let { site }: { site: Models.Site } = $props();

    const MAX_DEPLOYMENT_RETENTION = 36500;
    const getInitialDeploymentRetention = () => site.deploymentRetention;

    let retentionEnabled = $state(getInitialDeploymentRetention() > 0);
    let retentionDays = $state(
        getInitialDeploymentRetention() > 0 ? getInitialDeploymentRetention() : 30
    );
    const deploymentRetention = $derived(retentionEnabled ? retentionDays : 0);
    let isUnchanged = $derived(site.deploymentRetention === deploymentRetention);
    let isInvalid = $derived(
        retentionEnabled &&
            (retentionDays === null ||
                retentionDays < 1 ||
                retentionDays > MAX_DEPLOYMENT_RETENTION)
    );

    async function update() {
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: site.framework as Framework,
                enabled: site.enabled || undefined,
                logging: site.logging || undefined,
                timeout: site.timeout || undefined,
                installCommand: site.installCommand || undefined,
                buildCommand: site.buildCommand || undefined,
                outputDirectory: site.outputDirectory || undefined,
                buildRuntime: (site.buildRuntime as BuildRuntime) || undefined,
                adapter: site.adapter as Adapter,
                fallbackFile: site.fallbackFile || undefined,
                installationId: site.installationId || undefined,
                providerRepositoryId: site.providerRepositoryId || undefined,
                providerBranch: site.providerBranch || undefined,
                providerSilentMode: site.providerSilentMode || undefined,
                providerRootDirectory: site.providerRootDirectory || undefined,
                buildSpecification: site.buildSpecification || undefined,
                runtimeSpecification: site.runtimeSpecification || undefined,
                deploymentRetention
            });

            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message: 'Deployment retention has been updated'
            });
            trackEvent(Submit.SiteUpdateDeploymentRetention);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SiteUpdateDeploymentRetention);
        }
    }
</script>

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">Deployment retention</svelte:fragment>
        Automatically delete inactive deployments after a set number of days. Active deployments are never
        deleted.
        <svelte:fragment slot="aside">
            <InputSwitch
                id="deployment-retention-enabled"
                label="Delete inactive deployments"
                bind:value={retentionEnabled} />
            <InputNumber
                min={1}
                max={MAX_DEPLOYMENT_RETENTION}
                id="deployment-retention"
                label="Retention (days)"
                placeholder="Enter retention"
                disabled={!retentionEnabled}
                required
                bind:value={retentionDays} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isUnchanged || isInvalid} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
