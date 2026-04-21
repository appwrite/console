<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';

    let { site }: { site: Models.Site } = $props();

    const MAX_DEPLOYMENT_RETENTION = 36500;
    const DEPLOYMENT_RETENTION_OPTIONS = [
        { value: 7, label: '1 week' },
        { value: 30, label: '1 month' },
        { value: 90, label: '3 months' },
        { value: 180, label: '6 months' },
        { value: 365, label: '1 year' },
        { value: 730, label: '2 years' },
        { value: 1825, label: '5 years' },
        { value: 3650, label: '10 years' },
        { value: MAX_DEPLOYMENT_RETENTION, label: '100 years' }
    ];
    const getInitialDeploymentRetention = () => site.deploymentRetention;
    const getRetentionOptions = (retention: number) => {
        const hasCurrentOption = DEPLOYMENT_RETENTION_OPTIONS.some(
            (option) => option.value === retention
        );

        if (retention < 1 || retention > MAX_DEPLOYMENT_RETENTION || hasCurrentOption) {
            return DEPLOYMENT_RETENTION_OPTIONS;
        }

        return [{ value: retention, label: `${retention} days` }, ...DEPLOYMENT_RETENTION_OPTIONS];
    };

    let retentionEnabled = $state(getInitialDeploymentRetention() > 0);
    let retentionDays = $state(
        getInitialDeploymentRetention() > 0 ? getInitialDeploymentRetention() : 30
    );
    const retentionOptions = $derived(getRetentionOptions(retentionDays));
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
            <InputSelect
                id="deployment-retention"
                label="Retention period"
                placeholder="Select retention period"
                options={retentionOptions}
                disabled={!retentionEnabled}
                required
                bind:value={retentionDays} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isUnchanged || isInvalid} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
