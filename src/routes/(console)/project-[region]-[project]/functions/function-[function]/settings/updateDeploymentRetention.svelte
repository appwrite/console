<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Runtime, type Models, type Scopes } from '@appwrite.io/console';

    let { func }: { func: Models.Function } = $props();

    const MAX_DEPLOYMENT_RETENTION = 36500;
    const getInitialDeploymentRetention = () => func.deploymentRetention;

    let retentionEnabled = $state(getInitialDeploymentRetention() > 0);
    let retentionDays = $state(
        getInitialDeploymentRetention() > 0 ? getInitialDeploymentRetention() : 30
    );
    const deploymentRetention = $derived(retentionEnabled ? retentionDays : 0);
    let isUnchanged = $derived(func.deploymentRetention === deploymentRetention);
    let isInvalid = $derived(
        retentionEnabled &&
            (retentionDays === null ||
                retentionDays < 1 ||
                retentionDays > MAX_DEPLOYMENT_RETENTION)
    );

    async function update() {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }

            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime,
                execute: func.execute || undefined,
                events: func.events || undefined,
                schedule: func.schedule || undefined,
                timeout: func.timeout || undefined,
                enabled: func.enabled || undefined,
                logging: func.logging || undefined,
                entrypoint: func.entrypoint || undefined,
                commands: func.commands || undefined,
                scopes: (func.scopes as Scopes[]) || undefined,
                installationId: func.installationId || undefined,
                providerRepositoryId: func.providerRepositoryId || undefined,
                providerBranch: func.providerBranch || undefined,
                providerSilentMode: func.providerSilentMode || undefined,
                providerRootDirectory: func.providerRootDirectory || undefined,
                buildSpecification: func.buildSpecification || undefined,
                runtimeSpecification: func.runtimeSpecification || undefined,
                deploymentRetention
            });

            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Deployment retention has been updated'
            });
            trackEvent(Submit.FunctionUpdateDeploymentRetention);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateDeploymentRetention);
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
